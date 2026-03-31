/* eslint-disable class-methods-use-this */
import { debounce } from 'lodash';

import selectors from 'selectors';
import { store } from 'store';

import { cookieManager } from 'helpers/cookieManager';

import { filterSensitiveData } from 'utils/sensitiveDataFilter';

import { FILTERED_ERROR_MESSAGES } from 'constants/customConstant';

const sendEventDebouncedTime = 1000;

const isDevelopment = process.env.NODE_ENV === 'development';

const isProductionBranch = process.env.ENV === 'production';

const eventCounts = {
  [FILTERED_ERROR_MESSAGES.NO_MATCHING_ANNOTATION_ERROR_MESSAGE]: 0,
  [FILTERED_ERROR_MESSAGES.CANNOT_FIND_ANNOTATION_ERROR_MESSAGE]: 0,
  [FILTERED_ERROR_MESSAGES.ADS_LINKEDIN_ERROR]: 0,
};

const customKey = 'countEventsByLumin';

export class LoggerService {
  constructor() {
    this.createLogger();
    this.sendEventDebounced = debounce(this.sendEventWithCounts, sendEventDebouncedTime);
  }

  sendEventWithCounts = (eventName, logData) => {
    if (eventName && eventCounts[eventName] > 0) {
      logData[customKey] = eventCounts[eventName];
      this.error(logData);
      eventCounts[eventName] = 0;
    }
  };

  getInstance = async () => {
    const instance = await import('./datadogServices');
    this.datadogLogs = instance.default;
    return this.datadogLogs;
  };

  shouldSendEvent = (logData, customKey) => {
    const filteredMessages = Object.values(FILTERED_ERROR_MESSAGES);

    return filteredMessages.some((msg) => logData.message?.includes(msg)) && !logData.message?.includes(customKey);
  };

  getEventName = (logData) => {
    const filteredMessages = Object.values(FILTERED_ERROR_MESSAGES);
    return filteredMessages.find((msg) => logData.message?.includes(msg)) || null;
  };

  createLogger = () =>
    this.getInstance().then((log) =>
      log.init({
        clientToken: process.env.DATADOG_CLIENT_TOKEN,
        site: 'datadoghq.com',
        service: 'lumin-web-viewer',
        env: process.env.ENV,
        version: process.env.VERSION,
        forwardErrorsToLogs: true,
        sampleRate: 100,
        beforeSend: (logData) => {
          const state = store.getState();
          const currentUser = selectors.getCurrentUser(state);
          const userInfo = {
            anonymousUserId: cookieManager.anonymousUserId,
            userId: currentUser?._id,
          };

          const filteredUserInfo = filterSensitiveData(userInfo);

          try {
            const message = JSON.parse(logData.message);
            const filteredMessage = filterSensitiveData(message);
            logData.message = JSON.stringify({
              ...filteredMessage,
              ...filteredUserInfo,
            });
          } catch (_) {
            // For console.error || unhandled rejection || network error, `message` is a string
            logData.message = JSON.stringify({
              message: logData.message,
              ...filteredUserInfo,
            });
          }

          const filteredLogData = filterSensitiveData(logData);

          if (this.shouldSendEvent(filteredLogData, customKey)) {
            const eventName = this.getEventName(filteredLogData);
            this.sendEventDebounced(eventName, filteredLogData);
            eventCounts[eventName]++;
            return false;
          }
          return true;
        },
      })
    );

  /**
   *
   * @param {object} message
   */
  info = (message) => {
    const filteredMessage = filterSensitiveData(message);
    this.datadogLogs &&
      this.datadogLogs.logger.info(JSON.stringify({ ...filteredMessage, browser: window.navigator.userAgent }));
  };

  /**
   *
   * @param {object} message
   */
  debug = (message) => {
    const filteredMessage = filterSensitiveData(message);
    this.datadogLogs &&
      this.datadogLogs.logger.debug(JSON.stringify({ ...filteredMessage, browser: window.navigator.userAgent }));
  };

  /**
   *
   * @param {object} message
   */
  warn = (message) => {
    const filteredMessage = filterSensitiveData(message);
    this.datadogLogs &&
      this.datadogLogs.logger.warn(JSON.stringify({ ...filteredMessage, browser: window.navigator.userAgent }));
  };

  /**
   *
   * @param {object} message
   */
  error = (message) => {
    const filteredMessage = filterSensitiveData(message);
    if (isDevelopment || !isProductionBranch) {
      console.error(filteredMessage);
    }
    if (!isDevelopment) {
      this.datadogLogs &&
        this.datadogLogs.logger.error(JSON.stringify({ ...filteredMessage, browser: window.navigator.userAgent }));
    }
  };
}

const loggerServices = new LoggerService();
export default loggerServices;
