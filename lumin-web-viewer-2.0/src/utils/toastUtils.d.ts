type Toast = {
  title?: string;
  message: string | JSX.Element;
  // TODO: Should declare enum for `type`
  type: string;
  error?: unknown;
  duration?: number;
  id?: string;
  limit?: number;
  action?: {
    action: string;
    callback: () => void;
  };
  onRemoval?: () => void;
  useReskinToast?: boolean;
  disableAnimationInEffect?: boolean;
  persist?: boolean;
  TransitionProps?: {
    exit?: boolean;
  };
};

type CloseCallback = () => void;

declare namespace toastUtils {
  function openToastMulti(toast: Toast): Promise<CloseCallback>;
  function openUnknownErrorToast(toast?: Omit<Toast, 'type'>): Promise<CloseCallback>;
  function success(toast: Omit<Toast, 'type'>): Promise<CloseCallback>;
  function error(toast: Omit<Toast, 'type'>): Promise<CloseCallback>;
  function warn(toast: Omit<Toast, 'type'>): Promise<CloseCallback>;
  function info(toast: Omit<Toast, 'type'>): Promise<CloseCallback>;
  function waitForToastRemoval(id: string): Promise<void>;
  function openScimBlockedErrorToast(toast: Omit<Toast, 'type'>): Promise<CloseCallback>;
}

export default toastUtils;
