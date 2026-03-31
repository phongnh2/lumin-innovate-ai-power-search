import { IdentityCredentialsOidcProvider, SettingsFlow, IdentityWithCredentialsSaml } from '@ory/client';
import { isUiNodeInputAttributes } from '@ory/integrations/ui';
import { get, unset } from 'lodash';
import type { NextApiResponse } from 'next';
import { createHandler, Post, UseMiddleware, Body, HttpCode, Response, Catch } from 'next-api-decorators';

import { LOGIN_SERVICE_TO_ORY_PROVIDER, OIDC_PROVIDER_TO_LOGIN_SERVICE } from '@/constants/auth';
import { ErrorCode } from '@/constants/errorCode';
import { ValidatorRule } from '@/constants/validator-rule';
import { Identity, OryProvider } from '@/interfaces/ory';
import { LoginService, UNKNOWN_THIRD_PARTY } from '@/interfaces/user';
import { exceptionHandler } from '@/lib/exceptions/exceptionHandler';
import grpc from '@/lib/grpc';
import { executeWithTimeLogger } from '@/lib/logger/executeWithTimeLogger';
import { identityApi } from '@/lib/ory';
import { KratosHookGuard } from '@/middlewares';
import { KratosCallbackRequestOutput } from '@/proto/auth/kratos/KratosCallbackRequest';
import { TraitsOutput } from '@/proto/auth/kratos/Traits';
import { authService } from '@/services/auth.service';
import { callbackService } from '@/services/callback.service';
import { isLoginWithThirdParty } from '@/utils/auth.utils';
import { validatorUtils } from '@/utils/validator.utils';

interface IKratosCallback {
  identity: {
    id?: string;
    created_at: string;
    updated_at: string;
    is_verified: boolean;
    traits: TraitsOutput;
  };
  flow: {
    transient_payload: {
      loginChallenge: string;
      platform?: string;
      userAgent?: string;
      anonymousUserId?: string;
    };
    id: string;
  };
}

const constructCallbackBody = (
  body: IKratosCallback
): KratosCallbackRequestOutput & { flow: { transient_payload: { loginChallenge: string; platform?: string } } } => {
  const { identity, flow } = body;
  const { transient_payload } = flow || {};

  const payload: KratosCallbackRequestOutput & { flow: { transient_payload: { loginChallenge: string } } } = {
    ...body,
    identity: {
      ...identity,
      createdAt: identity.created_at,
      updatedAt: identity.updated_at,
      isVerified: identity.is_verified,
      traits: {
        ...identity.traits,
        email: identity.traits.email.toLowerCase()
      }
    }
  };

  if (transient_payload) {
    payload.transientPayload = {
      ...(transient_payload.platform && { platform: transient_payload.platform }),
      ...(transient_payload.userAgent && { userAgent: transient_payload.userAgent }),
      ...(transient_payload.anonymousUserId && { anonymousUserId: transient_payload.anonymousUserId })
    };
  }

  return payload;
};

/*
Swagger documentation for this API is located in:
 - docs/swagger/paths/callbacks-path.yaml
 - docs/swagger/schemas/callbacks-schema.yaml
*/
@Catch(exceptionHandler)
@UseMiddleware(KratosHookGuard)
class KratosHookHandler {
  @Post('/kratos-registration-flow-v2')
  @HttpCode(201)
  async handleKratosRegistrationFlowCallbackV2(@Body() body: IKratosCallback, @Response() res: NextApiResponse): Promise<void> {
    return executeWithTimeLogger({
      fn: async () => {
        const transformedBody = constructCallbackBody(body);

        // `parse: true` config make the identityId is 00000000-0000-0000-0000-000000000000 so we need to remove this value and update later.
        if (transformedBody.identity?.traits?.loginService !== LoginService.EMAIL_PASSWORD && transformedBody.identity?.id) {
          unset(transformedBody, 'identity.id');
        }

        // For password registration, update Kratos identity traits to include loginService
        if (transformedBody.identity?.traits?.loginService === LoginService.EMAIL_PASSWORD && transformedBody.identity?.id) {
          await identityApi.patchIdentity({
            id: transformedBody.identity.id,
            jsonPatch: [
              {
                op: 'add',
                path: '/traits/loginService',
                value: LoginService.EMAIL_PASSWORD
              }
            ]
          });
        }
        const { error } = (await grpc.kratos.handleKratosRegistrationFlowCallbackV2(transformedBody)) || {};
        if (error) {
          const errorMessage = authService.transformErrorMessageOnRegistrationFailed({
            errorCode: error.code,
            loginServiceFromError: error.metadata?.loginService as LoginService,
            loginChallenge: body.flow?.transient_payload?.loginChallenge || ''
          });
          if (errorMessage) {
            return res.status(400).send(errorMessage);
          }
        }
      },
      extraPayload: {
        loginService: body.identity.traits.loginService,
        hookEndpoint: '/kratos-registration-flow-v2',
        flowId: body.flow?.id
      }
    });
  }

  // Deprecated, we use kratos-registration-flow-v2 instead
  @Post('/kratos-registration-flow')
  @HttpCode(201)
  async handleKratosRegistrationFlowCallback(@Body() body: IKratosCallback): Promise<void> {
    return executeWithTimeLogger({
      fn: async () => {
        const transformedBody = constructCallbackBody(body);
        // This hook is used for both registration oidc and password but oidc account hook use parse: true to open/google to ok.
        // With this config ory make temporaty identityId is 00000000-0000-0000-0000-000000000000 so we need to remove this value and update later.
        if (transformedBody.identity?.traits?.loginService !== LoginService.EMAIL_PASSWORD && transformedBody.identity?.id) {
          unset(transformedBody, 'identity.id');
        }
        await grpc.kratos.handleKratosRegistrationFlowCallback(transformedBody);
      },
      extraPayload: {
        loginService: body.identity.traits.loginService,
        hookEndpoint: '/kratos-registration-flow',
        flowId: body.flow?.id
      }
    });
  }

  // Deprecated, we use kratos-registration-flow-v2 instead
  @Post('/kratos-verify-email-oidc-registration')
  async handleKratosVerifyEmailOidcRegistrationCallback(@Body() body: IKratosCallback, @Response() res: NextApiResponse): Promise<void> {
    return executeWithTimeLogger({
      fn: async () => {
        const { identity, flow } = constructCallbackBody(body);
        if (!identity || !identity.traits) {
          return;
        }
        const { email, loginService } = identity.traits;
        const { error } = await authService.verifyRegisterAccount({ email, loginService: loginService as unknown as LoginService });
        const isUnknownThirdParty = error?.meta?.loginService === UNKNOWN_THIRD_PARTY;
        if (isUnknownThirdParty || ![ErrorCode.User.EMAIL_IS_BANNED, ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD].includes(error?.code as string)) {
          return {
            identity: authService.getVerifiedIdentityPayload({ identity: identity as unknown as Identity })
          };
        }
        const errorMessage = authService.transformErrorMessageOnRegistrationFailed({
          errorCode: error?.code as string,
          loginServiceFromError: error?.meta?.loginService as LoginService,
          loginChallenge: flow?.transient_payload?.loginChallenge || ''
        });
        if (errorMessage) {
          return res.status(400).send(errorMessage);
        }
      },
      extraPayload: {
        loginService: body.identity?.traits?.loginService,
        hookEndpoint: '/kratos-verify-email-oidc-registration',
        flowId: body.flow?.id
      }
    });
  }

  @Post('/kratos-verification-flow')
  @HttpCode(201)
  async handleKratosVerificationFlowCallback(@Body() body: IKratosCallback): Promise<void> {
    await grpc.kratos.handleKratosVerificationFlowCallback(constructCallbackBody(body));
  }

  @Post('/kratos-sync-up-settings-data')
  @HttpCode(201)
  // Temporary disable, already refactor this on develop env
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async handleKratosSyncUpSettingsDataCallback(@Body() body: { identity: Identity }): Promise<void> {
    const identity = await identityApi.getIdentity({ identityId: body.identity.id, includeCredential: ['oidc', 'password'] });
    const oidcProviders = (get(identity, 'credentials.oidc.config.providers') as unknown as IdentityCredentialsOidcProvider[]) || [];
    const loginService = identity.traits.loginService as LoginService;

    const currentProvider = LOGIN_SERVICE_TO_ORY_PROVIDER[loginService];
    const currentCredential = oidcProviders.find(({ provider }) => provider === currentProvider);
    const newCredential = oidcProviders.find(({ provider }) => provider !== currentProvider);
    if (newCredential) {
      const { success } = await callbackService.handleLinkAccountFlow({
        identity,
        currentCredential,
        linkedCredential: newCredential
      });
      if (!success) {
        return;
      }
      body.identity.traits.loginService = OIDC_PROVIDER_TO_LOGIN_SERVICE[newCredential.provider as OryProvider];
    }

    const constructedBody = constructCallbackBody(body as unknown as IKratosCallback);
    constructedBody.identity!.isVerified = true;
    grpc.contractAuthService.syncUpAccountSetting({ identityId: constructedBody.identity?.id, type: 'changeName' });
    await grpc.kratos.handleKratosSyncUpSettingsDataCallback(constructedBody);
  }

  @Post('/kratos-after-login-flow')
  @HttpCode(201)
  async handleKratosAfterLoginFlowCallback(@Body() body: { identity: Identity }): Promise<void> {
    const currentLoginService = body.identity.traits.loginService as LoginService;
    if (body.identity.organization_id && currentLoginService !== LoginService.SAML_SSO) {
      const identity = await identityApi.getIdentity({ identityId: body.identity.id });
      const credentialsSaml = get(identity, 'credentials.saml') as unknown as IdentityWithCredentialsSaml;
      if (credentialsSaml) {
        await authService.updateIdentityLoginService({ identity, loginService: LoginService.SAML_SSO });
        await grpc.kratos.linkSamlLoginService({ identityId: body.identity.id });
      }
    }
    authService.updateUserLastLogin(body.identity.id);
  }

  @Post('/kratos-after-registration-flow')
  @HttpCode(201)
  async handleKratosAfterRegistrationFlowCallback(@Body() body: { flow: { id: string }; identity: Identity }): Promise<void> {
    return executeWithTimeLogger({
      fn: async () => {
        const { identity } = body;
        const { email, loginService } = identity.traits;
        const isOidcLoginService = isLoginWithThirdParty(loginService);
        if (!isOidcLoginService) {
          return;
        }
        grpc.user.addSyncOidcAvatarTask({ email });
      },
      extraPayload: {
        loginService: body.identity.traits.loginService,
        hookEndpoint: '/kratos-after-registration-flow',
        flowId: body.flow?.id
      }
    });
  }

  @Post('/kratos-validate-settings-data')
  @HttpCode(201)
  async handleKratosValidateSettingsDataCallback(@Body() body: { flow: SettingsFlow }, @Response() res: NextApiResponse): Promise<void> {
    const { flow } = body;

    // extract traits.name from flow.ui.nodes
    const nameNode = flow.ui?.nodes?.find(node => {
      if (isUiNodeInputAttributes(node.attributes)) {
        return node.attributes.name === 'traits.name';
      }
      return false;
    });

    const nameValue = nameNode && isUiNodeInputAttributes(nameNode.attributes) ? (nameNode.attributes.value as string) : undefined;

    // validate traits.name if it exists - following the same validation logic as yup username schema
    const trimmedName = nameValue?.trim() || '';
    const isValidName =
      trimmedName !== '' &&
      trimmedName.length <= ValidatorRule.Username.MaxLength &&
      validatorUtils.validateNameUrl(trimmedName) &&
      validatorUtils.validateNameHtml(trimmedName) &&
      validatorUtils.validateDangerousUriSchemes(trimmedName);

    if (!isValidName) {
      const invalidNameErrorMessage = JSON.stringify({
        messages: [
          {
            messages: [
              {
                id: 1001,
                text: 'Updated name is invalid',
                type: 'error',
                context: {
                  code: ErrorCode.User.UPDATED_NAME_INVALID,
                  message: 'Updated name is invalid'
                }
              }
            ]
          }
        ]
      });
      return res.status(400).send(invalidNameErrorMessage);
    }

    // Check if 'sub' field is being modified
    const subNode = flow.ui?.nodes?.find(node => {
      if (isUiNodeInputAttributes(node.attributes)) {
        return node.attributes.name === 'traits.sub';
      }
      return false;
    });

    const subValue = subNode && isUiNodeInputAttributes(subNode.attributes) ? subNode.attributes.value : undefined;
    const originalSub = body.flow.identity.traits.sub;

    // If sub field exists in the form and is different from the original, reject the modification
    if (subValue !== undefined && subValue !== originalSub) {
      const subModificationErrorMessage = JSON.stringify({
        messages: [
          {
            messages: [
              {
                id: 1002,
                text: 'The sub field cannot be modified',
                type: 'error',
                context: {
                  code: ErrorCode.User.UPDATED_NAME_INVALID,
                  message: 'The sub field cannot be modified'
                }
              }
            ]
          }
        ]
      });
      return res.status(400).send(subModificationErrorMessage);
    }

    return res.status(200).send({
      identity: {
        traits: {
          ...body.flow.identity.traits,
          name: trimmedName
        }
      }
    });
  }
}

export default createHandler(KratosHookHandler);
