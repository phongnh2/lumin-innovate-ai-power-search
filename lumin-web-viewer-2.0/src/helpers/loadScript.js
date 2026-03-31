import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

const loadScript = (scriptSrc, warning, options) =>
  new Promise((resolve, reject) => {
    const { async = false, defer = false, id = '' } = options || {};
    if (!scriptSrc) {
      // eslint-disable-next-line no-promise-executor-return
      return resolve();
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      console.error(err);
      if (warning) {
        logger.logInfo({
          message: warning,
          reason: LOGGER.Service.COMMON_ERROR,
        });
      }
      reject(err);
    };
    script.src = scriptSrc;
    script.async = async;
    script.defer = defer;
    script.id = id;
    document.getElementsByTagName('head')[0].appendChild(script);
  });

export default loadScript;
