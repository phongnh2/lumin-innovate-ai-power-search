import { parseName } from 'humanparser';

import { CookieConsentEnum } from 'features/cookieConsents/constants';

import { PageViewTracker } from './PageViewTracker';
import { cookieConsents } from '../../../features/cookieConsents/cookieConsents';

export class BrazeAdaptee {
  execute = (callback) => {
    if (this.isLoadedSDK) {
      callback();
    }
  };

  updateCookiesAccepted = () => {
    this.acceptedCookies = cookieConsents.isCookieAllowed(CookieConsentEnum.NonEssential);
  };

  send = ({ name, parameters }) => this.execute(() => this.sendEvent({ name, parameters }));

  clear = () => this.execute(() => this.clearData());

  init = (user) => this.execute(() => this.initUser(user));

  getInstance = async () => {
    if (this.brazeInstance) {
      return this.brazeInstance;
    }
    const brazeInstance = await import('@braze/web-sdk');
    this.brazeInstance = brazeInstance;
    return this.brazeInstance;
  };

  createBrazeInstance = () =>
    this.getInstance().then((braze) => {
      this.isLoadedSDK = braze.initialize(process.env.BRAZE_API_KEY, {
        baseUrl: process.env.BRAZE_SDK_URL,
        appVersion: process.env.VERSION,
        enableLogging: false,
        allowUserSuppliedJavascript: true,
      });
    });

  initUser = async (user) =>
    this.getInstance().then((braze) => {
      braze.changeUser(user._id);
      braze.automaticallyShowInAppMessages();
      const { firstName, middleName, lastName } = parseName(user.name);
      const fullLastName = [middleName, lastName].filter(Boolean).join(' ');
      const brazeUser = braze.getUser();
      brazeUser.setFirstName(firstName);
      brazeUser.setLastName(fullLastName);
      brazeUser.setEmail(user.email);
      this.updateCookiesAccepted();
      braze.openSession();
      this.pageViewTracker = new PageViewTracker((eventName, attributes) =>
        this.send({ name: eventName, parameters: attributes })
      );
      this.isInitializedUser = true;
    });

  clearData = () => {
    if (this.brazeInstance) {
      this.pageViewTracker?.cleanup();
      this.brazeInstance.wipeData();
      this.isInitializedUser = false;
    }
  };

  sentEventWithoutCookieAccepted = async ({ name, parameters, user }) => {
    if (!this.brazeInstance && !this.isInitializedUser) {
      await this.createBrazeInstance();
      await this.initUser(user);
    }
    this.getInstance().then((braze) => {
      braze.logCustomEvent(name, parameters);
    });
  };

  sendEvent = async ({ name, parameters }) => {
    if (this.brazeInstance && this.isInitializedUser && this.acceptedCookies) {
      this.brazeInstance.logCustomEvent(name, parameters);
    }
  };
}

const brazeAdaptee = new BrazeAdaptee();
export default brazeAdaptee;
