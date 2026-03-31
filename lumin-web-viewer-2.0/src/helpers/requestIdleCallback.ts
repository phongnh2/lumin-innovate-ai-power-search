export type IdleCallbackId = number | ReturnType<typeof setTimeout>;

export const requestIdleCallback = (callback: () => void): IdleCallbackId => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback);
  }
  return setTimeout(callback, 0);
};

export const cancelIdleCallback = (idleCallbackId: IdleCallbackId) => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(idleCallbackId as number);
  } else {
    clearTimeout(idleCallbackId);
  }
};
