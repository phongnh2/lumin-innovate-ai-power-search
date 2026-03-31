export class BaseLogger {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getCommonInfo = () => {
    return { browser: window.navigator.userAgent };
  };
}
