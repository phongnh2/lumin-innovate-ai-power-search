declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (
            config: IGoogleOneTapLoginProps & {
              callback: (response: IGoogleCallbackResponse) => void;
              use_fedcm_for_prompt?: boolean;
              auto_select?: boolean;
              context?: string;
              itp_support?: boolean;
            }
          ) => void;
          prompt: (
            momentListener?: (notification: {
              getMomentType: () => string;
              getDismissedReason: () => string;
              getSkippedReason: () => string;
              isDisplayed: () => boolean;
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
            }) => void
          ) => void;
          cancel: () => void;
        };
      };
    };
    __googleOneTapScript__?: boolean;
  }
}

export interface IGoogleOneTapLogin extends IUseGoogleOneTapLogin {
  children?: React.ReactElement | null;
}

export interface IUseGoogleOneTapLogin {
  disabled?: boolean;
  disableCancelOnUnmount?: boolean;
  onError?: (error?: Error | string) => void;
  googleAccountConfigs: IGoogleOneTapLoginProps;
  onSuccess?: (response: IGoogleEndPointResponse) => void;
}

/**
 * @see https://developers.google.com/identity/gsi/web/reference/js-reference#IdConfiguration
 */
export interface IGoogleOneTapLoginProps {
  nonce?: string;
  context?: string;
  client_id: string;
  auto_select?: boolean;
  prompt_parent_id?: string;
  state_cookie_domain?: string;
  cancel_on_tap_outside?: boolean;
  callback?: (...args: unknown[]) => unknown;
  native_callback?: (...args: unknown[]) => unknown;
}

export interface IGoogleCallbackResponse {
  credential?: string;
}

/**
 * @see https://developers.google.com/identity/gsi/web/guides/display-google-one-tap#js-callback
 */
export interface IGoogleEndPointResponse {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
}
