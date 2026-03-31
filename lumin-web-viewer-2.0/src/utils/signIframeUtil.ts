import { SIGN_APP_URL } from 'constants/urls';

export interface IframeMessageListenerPayload<TAction> {
  type: 'close_task';
  state: 'completed' | 'discarded' | 'error';
  error?: Error;
  action: TAction;
  data?: unknown;
}

export const isValidIframeAction = <TAction, TPayload extends IframeMessageListenerPayload<TAction>>(
  e: MessageEvent<TPayload>,
  action: TAction
): boolean => {
  const { type, action: eventAction } = e.data;
  const fromLuminSignOrigin = e.origin === SIGN_APP_URL;
  const isCloseTask = type === 'close_task';
  const isSameAction = action === eventAction;

  return fromLuminSignOrigin && isCloseTask && isSameAction;
};
