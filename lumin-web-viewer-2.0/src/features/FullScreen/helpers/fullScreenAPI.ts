export const isInFullScreen = () => {
  const doc = document;
  return !!(
    doc.fullscreenElement ||
    doc.mozFullScreenElement ||
    doc.webkitFullscreenElement ||
    doc.msFullscreenElement
  );
};

export const requestFullScreen = (element: HTMLElement): Promise<void> => {
  const requestFullscreenMethods = [
    'requestFullscreen',
    'msRequestFullscreen',
    'webkitRequestFullscreen',
    'mozRequestFullScreen',
  ] as const;
  const requestFullscreenMethod = requestFullscreenMethods.find((method) => element[method]);
  if (!requestFullscreenMethod) {
    return Promise.reject(new Error('Fullscreen API is not supported'));
  }
  return element[requestFullscreenMethod]();
};

export const exitFullScreen = (doc: Document): Promise<void> => {
  const exitFullscreenMethods = [
    'exitFullscreen',
    'msExitFullscreen',
    'mozCancelFullScreen',
    'webkitExitFullscreen',
  ] as const;
  const exitFullscreenMethod = exitFullscreenMethods.find((method) => doc[method]);
  if (!exitFullscreenMethod) {
    return Promise.reject(new Error('Fullscreen API is not supported'));
  }
  return doc[exitFullscreenMethod]();
};
