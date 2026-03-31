import * as jwt from 'jsonwebtoken';

import { environment } from '@/configs/environment';
import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { Identity } from '@/interfaces/ory';
import { LoginService, ReCaptchaAction, UNKNOWN_THIRD_PARTY } from '@/interfaces/user';
import { IException } from '@/lib/exceptions/interfaces/exception';
import grpc from '@/lib/grpc';
import { logger } from '@/lib/logger';
import { identityApi } from '@/lib/ory';
import { User } from '@/proto/auth/common/User';

const NoError = { error: undefined };

interface AuthErrorException {
  error?: IException<{ loginService: LoginService }>;
  user?: User;
}

class AuthService {
  async verifySignIn(email: string): Promise<{
    isAccept?: boolean;
    error?: IException<{ loginService: LoginService }>;
  }> {
    const firstLoginWithOry = await grpc.kratos.verifyFirstSignInWithOry({ email });
    if (firstLoginWithOry && !firstLoginWithOry.isAccept && firstLoginWithOry.error) {
      return {
        error: {
          message: firstLoginWithOry.error.message,
          code: firstLoginWithOry.error.code,
          meta: {
            loginService: (firstLoginWithOry.error.metadata?.loginService || UNKNOWN_THIRD_PARTY) as LoginService
          }
        }
      };
    }
    const { error } = await this.verifySignAuthMethod({ email, loginService: LoginService.EMAIL_PASSWORD });
    if (!error) {
      return { isAccept: true };
    }
    return { error };
  }

  async verifyRegisterAccount({ email, loginService }: { email: string; loginService: LoginService }): Promise<{
    isAccept?: boolean;
    error?: IException<{ loginService: LoginService | typeof UNKNOWN_THIRD_PARTY }>;
  }> {
    const verifiedResponse = await grpc.kratos.verifyRegisterAccount({ email });
    if (verifiedResponse && verifiedResponse.error) {
      return {
        error: {
          message: verifiedResponse.error.message,
          code: verifiedResponse.error.code
        }
      };
    }
    const { user = null } = (await grpc.user.getUserByEmail({ email })) || {};
    let assertResult;
    if (loginService === LoginService.EMAIL_PASSWORD) {
      assertResult = this.excuteAsserts([
        await this.assertUnverifyAccountError(user),
        this.assertLoginDifferentAccountError({ user, loginService }),
        this.assertExistedAccountError(user)
      ]);
    } else {
      assertResult = this.excuteAsserts([this.assertLoginDifferentAccountError({ user, loginService })]);
    }
    const { error } = assertResult || {};
    if (!error) {
      return { isAccept: true };
    }
    return { error };
  }

  async verifyForgotPassword({ token, email, action }: { token: string; email: string; action: ReCaptchaAction }): Promise<{
    user?: User;
    error?: IException<{ loginService: LoginService }>;
  }> {
    const { error: verifyRecaptchaError } = (await grpc.user.verifyRecaptcha({ responseKey: token, action })) || {};
    if (verifyRecaptchaError) {
      return {
        error: {
          message: verifyRecaptchaError.message || CommonErrorMessage.Common.GRPC_ERROR,
          code: verifyRecaptchaError.code
        }
      };
    }
    const { user = null } = (await grpc.user.getUserByEmail({ email })) || {};
    const assertResult = this.excuteAsserts([
      this.assertNotFoundError(user),
      this.assertLoginDifferentAccountError({ user, loginService: LoginService.EMAIL_PASSWORD })
    ]);
    if (assertResult.error) {
      return assertResult;
    }

    return { user } as { user: User };
  }

  async verifySignAuthMethod({ email, loginService }: { email: string; loginService: LoginService }): Promise<{
    user?: User;
    error?: IException<{ loginService: LoginService }>;
  }> {
    const { user = null } = (await grpc.user.getUserByEmail({ email })) || {};
    const assertResult = this.excuteAsserts([
      this.assertIncorrectEmailPasswordError(user),
      await this.assertUnverifyAccountError(user),
      this.assertLoginDifferentAccountError({ user, loginService })
    ]);

    if (assertResult.error) {
      return assertResult;
    }

    return { user } as { user: User };
  }

  async verifyResendVerificationLink({ email }: { email: string }): Promise<{
    user?: User;
    error?: IException<{ loginService?: LoginService; remainingTime?: number }>;
  }> {
    const { user = null } = (await grpc.user.getUserByEmail({ email })) || {};
    const assertResult = this.excuteAsserts([
      this.assertLoginDifferentAccountError({ user, loginService: LoginService.EMAIL_PASSWORD }),
      this.assertAlreadyVerifyAccountError(user),
      this.assertNotFoundError(user)
    ]);
    if (assertResult.error) {
      return assertResult;
    }
    const { error } = (await grpc.auth.checkAttempResendVerification({ email })) || {};
    if (error) {
      return { error: error as IException };
    }
    return { user } as { user: User };
  }

  createEmailPasswordIdentity({ email, name }: { email: string; name: string }) {
    return identityApi.createIdentity({
      body: {
        traits: {
          email,
          name,
          loginService: LoginService.EMAIL_PASSWORD
        }
      },
      options: {
        verified: true
      }
    });
  }

  private assertNotFoundError(user: User | null) {
    if (!user) {
      return {
        error: {
          message: CommonErrorMessage.User.USER_NOT_FOUND,
          code: ErrorCode.User.USER_NOT_FOUND
        }
      };
    }
    return NoError;
  }

  private assertIncorrectEmailPasswordError(user: User | null) {
    /**
     * There are signals that attacks are attempting to crawl our email on the app by inputting an email and using the endpoint to confirm its existence.
     * We should not give them any information about the existence of the email.
     * Slack discussion: https://luminpdf.slack.com/archives/C03QLHHF673/p1708663100837929
     */
    if (!user) {
      return {
        error: {
          message: CommonErrorMessage.User.INCORRECT_CREDENTIAL,
          code: ErrorCode.User.INCORRECT_EMAIL_PASSWORD
        }
      };
    }
    return NoError;
  }

  private assertExistedAccountError(user: User | null) {
    if (user) {
      return {
        error: {
          message: CommonErrorMessage.User.EMAIL_READY_EXISTS,
          code: ErrorCode.User.EMAIL_EXISTS
        }
      };
    }
    return NoError;
  }

  private async assertUnverifyAccountError(user: User | null) {
    if (user?.identityId && !user.isVerified) {
      const { error } = (await grpc.auth.checkAttempResendVerification({ email: user.email })) || {};
      let remainingTime = 0;
      if (error) {
        remainingTime = (error?.metadata?.remainingTime as unknown as number) || 0;
      }
      return {
        error: {
          message: CommonErrorMessage.User.UNACTIVATED_ACCOUNT,
          code: ErrorCode.User.UNACTIVATED_ACCOUNT,
          meta: {
            remainingTime
          }
        },
        user
      };
    }
    return NoError;
  }

  private assertLoginDifferentAccountError({ user, loginService }: { user: User | null; loginService: LoginService }) {
    const isDifferentLoginService = user?.loginService && user?.loginService !== loginService;
    const hasIdentityId = loginService !== LoginService.EMAIL_PASSWORD && user?.identityId;
    const isEmailPasswordService = loginService === LoginService.EMAIL_PASSWORD;
    const isUnknownThirdParty = user?.loginService === UNKNOWN_THIRD_PARTY;

    if (isDifferentLoginService && (hasIdentityId || isEmailPasswordService)) {
      return {
        error: {
          message: CommonErrorMessage.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
          code: ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
          meta: {
            loginService: user?.loginService as unknown as LoginService
          }
        }
      };
    }
    if (!hasIdentityId && user && (!user.loginService || isUnknownThirdParty)) {
      return {
        error: {
          message: CommonErrorMessage.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
          code: ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
          meta: {
            loginService: UNKNOWN_THIRD_PARTY as LoginService
          }
        }
      };
    }
    return NoError;
  }

  private excuteAsserts(errorHandlers: AuthErrorException[]) {
    return errorHandlers.filter(err => err.error)[0] || NoError;
  }

  private assertAlreadyVerifyAccountError(user: User | null) {
    if (user?.isVerified === true) {
      return {
        error: {
          message: CommonErrorMessage.User.ALREADY_VERIFIED,
          code: ErrorCode.User.ALREADY_VERIFIED
        }
      };
    }
    return NoError;
  }

  async updateIdentityLoginService({
    identity,
    updatedSub,
    loginService
  }: {
    identity: Identity;
    updatedSub?: string;
    loginService: LoginService;
  }): Promise<void> {
    await identityApi.updateIdentity({
      identityId: identity.id,
      traits: {
        ...identity.traits,
        sub: updatedSub || identity.traits.sub,
        loginService
      }
    });
  }

  transformErrorMessageOnRegistrationFailed({
    errorCode,
    loginServiceFromError,
    loginChallenge
  }: {
    errorCode: string;
    loginChallenge: string;
    loginServiceFromError: LoginService;
  }): string {
    switch (errorCode) {
      case ErrorCode.User.EMAIL_IS_BANNED: {
        return JSON.stringify({
          messages: [
            {
              messages: [
                {
                  id: 1,
                  context: {
                    code: ErrorCode.User.EMAIL_IS_BANNED,
                    message: CommonErrorMessage.User.EMAIL_IS_BANNED
                  }
                }
              ]
            }
          ]
        });
      }
      case ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD: {
        return JSON.stringify({
          messages: [
            {
              messages: [
                {
                  id: 2,
                  context: {
                    code: ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
                    message: CommonErrorMessage.User.ALREADY_SIGNED_IN_ANOTHER_METHOD,
                    meta: {
                      loginService: loginServiceFromError,
                      loginChallenge
                    }
                  }
                }
              ]
            }
          ]
        });
      }
      default:
        return '';
    }
  }

  getVerifiedIdentityPayload({
    identity
  }: {
    identity: Identity;
  }): Omit<Identity, 'recovery_addresses'> & { recovery_addresses: Omit<Identity['recovery_addresses'], 'id'> } {
    return {
      ...identity,
      verifiable_addresses: [
        {
          status: 'completed',
          value: identity.traits.email,
          verified: true,
          via: 'email'
        }
      ],
      recovery_addresses: [
        {
          value: identity.traits.email,
          via: 'email'
        }
      ]
    };
  }

  async generateCannyToken(identity: Identity): Promise<string> {
    const avatarRemoteId = identity.traits.avatarRemoteId;
    const avatarURL = `${environment.public.host.backendUrl}/user/getAvatar?remoteId=${avatarRemoteId}`;
    const data = {
      ...(avatarRemoteId ? { avatarURL } : {}),
      email: identity.traits.email,
      id: identity.id,
      name: identity.traits.name
    };
    const secret = environment.internal.jwt.cannyJwtSecret;
    const expiresIn = environment.public.common.sessionLifespan;
    return jwt.sign(data, secret, { algorithm: 'HS256', expiresIn });
  }

  async updateUserLastLogin(identityId: string): Promise<void> {
    try {
      await grpc.auth.updateUserPropertiesByIdentityId({ identityId, properties: { lastLogin: String(new Date().getTime()) } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      logger.error({
        message: 'Error updating user last login',
        err: err,
        meta: { identityId },
        scope: this.updateUserLastLogin.name
      });
    }
  }
}

export const authService = new AuthService();
