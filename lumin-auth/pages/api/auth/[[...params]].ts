/* eslint-disable @typescript-eslint/no-explicit-any */
import { serialize } from 'cookie';
import { get } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Body, Catch, createHandler, Get, HttpCode, Post, Req, Res, ValidationPipe } from 'next-api-decorators';
import { ValidationError as ValidationErrorYup } from 'yup';

import { environment } from '@/configs/environment';
import { QUERY_KEYS } from '@/constants/common';
import { CookieStorageKey } from '@/constants/cookieKey';
import { ErrorCode } from '@/constants/errorCode';
import { InvitationTokenStatus } from '@/interfaces/auth';
import type { TIdentityRequest } from '@/interfaces/common';
import { ForgotPasswordDTO, ResendVerificationDTO, SignInDTO, SignUpDTO, SignUpInvitationDTO, VerifySSOEmailDTO } from '@/interfaces/dto/auth.dto';
import { Identity, OryLoginMethod } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { exceptionHandler } from '@/lib/exceptions/exceptionHandler';
import { HttpErrorException } from '@/lib/exceptions/HttpErrorException';
import grpc from '@/lib/grpc';
import { kratosService } from '@/lib/grpc/services/kratos';
import { constructFlowCsrfToken, frontendApi, identityApi } from '@/lib/ory';
import { projectApi } from '@/lib/ory/repositories/project-api';
import { signUpSchema } from '@/lib/yup';
import { AuthGuard, MobileAuthGuard } from '@/middlewares';
import RateLimitGuard from '@/middlewares/RateLimitGuard';
import { authService } from '@/services/auth.service';
import { getEmailDomain } from '@/utils/account.utils';

/*
Swagger documentation for this API is located in:
 - docs/swagger/paths/auth-path.yaml
 - docs/swagger/schemas/auth-schema.yaml
*/
@RateLimitGuard()
@Catch(exceptionHandler)
class AuthHandler {
  private readonly SET_COOKIE_HEADER = 'Set-Cookie';

  @Post('/forgot-password')
  @HttpCode(200)
  async handleForgotPassword(@Body(ValidationPipe) body: ForgotPasswordDTO, @Req() req: NextApiRequest): Promise<void> {
    const { email, flow, token, action } = body;
    const { user: userData, error } = await authService.verifyForgotPassword({ token, email, action });
    if (error) {
      if (error.code === ErrorCode.User.USER_NOT_FOUND) {
        return;
      }
      throw HttpErrorException.BadRequest({ message: error.message, code: error.code, meta: error.meta });
    }
    if (userData && !userData.identityId && userData.loginService === LoginService.EMAIL_PASSWORD) {
      const { email: userEmail, name } = userData;
      const oryIdentity = await identityApi.listIdentitiesByEmail(String(userEmail));
      const identityId = oryIdentity[0]?.id || (await authService.createEmailPasswordIdentity({ email: String(userEmail), name: String(name) })).id;
      await grpc.auth.updateUserPropertiesById({ userId: userData._id, properties: { identityId } });
    }
    await frontendApi.updateRecoveryFlow({
      flowId: flow.id,
      body: {
        csrf_token: constructFlowCsrfToken(flow),
        email
      },
      cookie: req.headers.cookie
    });
  }

  @Post('/sign-in')
  @HttpCode(200)
  async handleSignIn(@Body(ValidationPipe) body: SignInDTO, @Req() req: NextApiRequest, @Res() res: NextApiResponse): Promise<Identity | undefined> {
    const { email, password, flow } = body;
    const { error } = await authService.verifySignIn(email);
    if (error) {
      throw HttpErrorException.BadRequest({ message: error.message, code: error.code, meta: error.meta });
    }
    const { data, headers } = await frontendApi.updateLoginFlow({
      flowId: flow.id,
      body: {
        method: OryLoginMethod.Password,
        password: password,
        identifier: email,
        csrf_token: constructFlowCsrfToken(flow)
      },
      cookie: req.headers.cookie
    });
    res.setHeader(this.SET_COOKIE_HEADER, headers['set-cookie'] || []);
    return data.session.identity;
  }

  @AuthGuard()
  @Post('/sign-out')
  @HttpCode(204)
  async handleSignOut(@Req() req: TIdentityRequest, @Res() res: NextApiResponse): Promise<void> {
    const { sessionId } = req;
    try {
      grpc.kratos.handleSignOut({ id: sessionId });
      grpc.contractAuthService.handleSignOut({ id: sessionId });
      const domain = process.env.NODE_ENV === 'development' ? 'localhost' : 'luminpdf.com';
      res.setHeader(this.SET_COOKIE_HEADER, [
        `_lm_ath=empty; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
        `ory_hydra_session_dev=empty; Max-Age=0; path=/; domain=${domain}`
      ]);
      return;
    } catch (err) {
      throw HttpErrorException.BadRequest({ message: JSON.stringify(err) });
    }
  }

  @Post('/sign-up-invitation')
  @HttpCode(201)
  async handleSignUpInvitation(@Body(ValidationPipe) body: SignUpInvitationDTO, @Req() req: NextApiRequest): Promise<void> {
    const { token, name, password, flow } = body;

    const tokenResult = await grpc.kratos.verifyUserInvitationToken({
      token
    });

    if (!tokenResult || tokenResult.status === InvitationTokenStatus.INVALID || tokenResult.isSignedUp) {
      throw HttpErrorException.Forbidden({ message: 'Token invalid' });
    }

    const { email } = tokenResult.data || { email: '' };

    try {
      await signUpSchema.validate({
        email,
        name,
        password,
        term: true
      });
    } catch (e) {
      const error: ValidationErrorYup = e as any;
      throw HttpErrorException.BadRequest({ message: error.message });
    }

    // handle disclose authentication method
    const { error } = await authService.verifyRegisterAccount({ email, loginService: LoginService.EMAIL_PASSWORD });
    if (error) {
      if (error.code === ErrorCode.User.EMAIL_EXISTS) {
        return;
      }
      throw HttpErrorException.BadRequest({ message: error.message, code: error.code, meta: error.meta });
    }

    await frontendApi.updateRegistrationFlow({
      flowId: flow.id,
      body: {
        csrf_token: constructFlowCsrfToken(flow),
        method: OryLoginMethod.Password,
        password: String(password),
        traits: { email, name, loginService: LoginService.EMAIL_PASSWORD }
      },
      cookie: req.headers.cookie
    });

    await kratosService.afterSignUpInvitation({ email, token });
  }

  @Post('/sign-up')
  @HttpCode(201)
  async signUp(@Body(ValidationPipe) body: SignUpDTO, @Req() req: NextApiRequest): Promise<void> {
    const { flow, name, email, password, platform, anonymousUserId } = body;
    try {
      await signUpSchema.validate({
        email,
        name,
        password,
        term: true
      });
    } catch (e) {
      const error: ValidationErrorYup = e as any;
      throw HttpErrorException.BadRequest({ message: error.message });
    }
    const { error } = await authService.verifyRegisterAccount({ email, loginService: LoginService.EMAIL_PASSWORD });
    if (error) {
      if (error.code === ErrorCode.User.EMAIL_EXISTS) {
        return;
      }
      throw HttpErrorException.BadRequest({ message: error.message, code: error.code, meta: error.meta });
    }
    await frontendApi.updateRegistrationFlow({
      flowId: flow.id,
      body: {
        csrf_token: constructFlowCsrfToken(flow),
        method: OryLoginMethod.Password,
        password: String(password),
        traits: { email, name, loginService: LoginService.EMAIL_PASSWORD },
        transient_payload: { platform, userAgent: req.headers['user-agent'], anonymousUserId }
      },
      cookie: req.headers.cookie
    });
  }

  @AuthGuard()
  @Post('/force-log-out')
  @HttpCode(204)
  async handleForceLogout(@Req() req: TIdentityRequest): Promise<void> {
    await identityApi.revokeAllSession(req.identity.id);
    grpc.kratos.handleForceLogout({ id: req.identity.id });
    grpc.contractAuthService.handleForceLogout({ identityId: req.identity.id, type: req.body.type });
  }

  @Post('/resend-verification-link')
  @HttpCode(200)
  async resendVerificationLink(@Body(ValidationPipe) body: ResendVerificationDTO, @Req() req: NextApiRequest): Promise<void> {
    const { flow, email } = body;
    const { error } = await authService.verifyResendVerificationLink({ email });

    if (error && [ErrorCode.User.ALREADY_VERIFIED, ErrorCode.User.USER_NOT_FOUND].includes(error.code as string)) {
      return;
    }

    if (error) {
      throw HttpErrorException.BadRequest({
        message: error.message,
        code: error.code,
        meta: error.meta
      });
    }

    await frontendApi.updateVerificationFlow({
      flowId: flow.id,
      body: {
        csrf_token: constructFlowCsrfToken(flow),
        email
      },
      cookie: req.headers.cookie
    });

    await grpc.auth.setAttempResendVerification({ email });
  }

  @MobileAuthGuard()
  @Post('/create-temporary-access-url')
  @HttpCode(200)
  async createTemporaryAccess(@Req() req: TIdentityRequest): Promise<string> {
    const { user } = req;
    if (!user?.identityId) {
      throw HttpErrorException.BadRequest({ message: 'Cannot create link access' });
    }
    return identityApi.createRecoveryLink(user?.identityId);
  }

  @AuthGuard()
  @Get('/get-canny-redirect-url')
  @HttpCode(200)
  async getCannyRedirectUrl(@Req() req: TIdentityRequest) {
    const cannyBaseUrl = environment.public.host.cannyUrl;
    const redirectQuery = decodeURIComponent(req.query[QUERY_KEYS.REDIRECT] as string);
    const redirectUrl = redirectQuery.startsWith(cannyBaseUrl) ? redirectQuery : cannyBaseUrl;

    const cannyToken = await authService.generateCannyToken(req.identity);
    const companyID = environment.public.common.cannyCompanyID;
    const url = `https://canny.io/api/redirects/sso?companyID=${companyID}&ssoToken=${cannyToken}&redirect=${redirectUrl}`;
    return { url };
  }

  @Post('/forget-last-access-account')
  @HttpCode(200)
  async forgetLastAccessAccount(@Res() res: NextApiResponse) {
    const options = {
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    };

    res.setHeader(this.SET_COOKIE_HEADER, [
      serialize(CookieStorageKey.LAST_ACCESS_ACCOUNT, '', options),
      // Expire the legacy cookie set with Domain=.luminpdf.com so the old cookie is removed after switching to host-only (no domain) cookies.
      serialize(CookieStorageKey.LAST_ACCESS_ACCOUNT, '', {
        ...options,
        domain: '.luminpdf.com'
      })
    ]);
  }

  @Post('/sso/verify-email')
  @HttpCode(200)
  async verifyEmail(@Body() body: VerifySSOEmailDTO): Promise<{ providerId: string; organizationId: string }> {
    const { email } = body;
    const domain = getEmailDomain(email);
    const { organizations } = await projectApi.listOrganizations({
      domain
    });
    if (organizations.length === 0) {
      throw HttpErrorException.BadRequest({
        code: ErrorCode.User.EMAIL_NOT_CONFIGURED_FOR_SSO,
        message: 'Email not configured for SSO'
      });
    }
    const organization = organizations[0];
    const project = await projectApi.getProject();
    const providers = get(project.services.identity?.config, 'selfservice.methods.saml.config.providers', []);
    const foundProvider = providers.find((provider: Record<string, unknown>) => provider.organization_id === organization.id) as { id: string } | undefined;
    if (!foundProvider) {
      throw HttpErrorException.BadRequest({
        code: ErrorCode.User.EMAIL_NOT_CONFIGURED_FOR_SSO,
        message: 'Email not configured for SSO'
      });
    }
    return { providerId: foundProvider.id, organizationId: organization.id };
  }
}

export default createHandler(AuthHandler);
