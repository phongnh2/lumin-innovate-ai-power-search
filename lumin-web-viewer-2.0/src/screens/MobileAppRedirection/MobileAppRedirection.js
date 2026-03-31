import React, { useEffect } from 'react';

import { isIOS, isAndroid } from 'helpers/device';
import { APPLE_STORE_APP_URL, GOOGLE_PLAY_APP_URL } from 'constants/mobileApp';

const MobileAppRedirection = () => {
  useEffect(() => {
    // let timeout = null;
    if (isAndroid) {
      window.open(GOOGLE_PLAY_APP_URL, '_self');
      return;
    }
    if (isIOS) {
      /**
       * We need to setTimeout here
       * This is a trick to prevent the App store has been opened before jumping to our mobile app
       */
      window.location.href = APPLE_STORE_APP_URL;
      // timeout = setTimeout(() => {
      //   window.location.href = APPLE_STORE_APP_URL;
      // }, 25);
    }
    // return () => {
    //   clearTimeout(timeout);
    // };
  }, []);
  return (
    <div />
  );
};

MobileAppRedirection.propTypes = {

};

export default MobileAppRedirection;
