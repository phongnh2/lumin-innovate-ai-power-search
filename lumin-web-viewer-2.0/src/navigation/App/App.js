import PropTypes from 'prop-types';
import React from 'react';

import { hubspotServices } from 'services';

import { cookieManager } from 'helpers/cookieManager';

import { BannerName } from 'utils/Factory/EventCollection/BannerEventCollection';
import clickEvent from 'utils/Factory/EventCollection/ClickEventCollection';
import googleDriveEvent from 'utils/Factory/EventCollection/GoogleDriveEventCollection';

import { CookieConsentEnum } from 'features/cookieConsents/constants';
import { cookieConsents } from 'features/cookieConsents/cookieConsents';

import { BANNER_INTERACTIONS } from 'constants/lumin-common';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import appSocketService from './helpers/AppSocketService';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevAcceptedCookies: null,
    };
  }

  componentDidMount() {
    const { location } = this.props;
    appSocketService.subscribe();
    window.addEventListener('click', clickEvent.clickListener, true);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    hubspotServices.trigger(location.pathname);
    [BannerName.DESKTOP_APP_DOWNLOAD_IN_RIGHT_BANNER].forEach((key) =>
      sessionStorage.removeItem(`${key}_${BANNER_INTERACTIONS.VIEWED}`)
    );
    // This code can remove after 1 year from this feature release https://lumin.atlassian.net/browse/LP-6713
    cookieManager.delete('cookie_accept', { domain: null });
    cookieManager.delete('cookie_accept');
  }

  shouldComponentUpdate({ location: nextLocation }) {
    const { gtag } = window;
    const { location } = this.props;
    const isRouterChange = nextLocation.pathname !== location.pathname;
    const acceptedCookies = cookieConsents.isCookieAllowed(CookieConsentEnum.NonEssential);

    if (this.state.prevAcceptedCookies !== acceptedCookies) {
      this.setState({ prevAcceptedCookies: acceptedCookies });
      if (isRouterChange && acceptedCookies) {
        if (typeof gtag === 'function') {
          gtag('config', 'UA-41471845-1', {
            page_location: window.location.href,
            page_path: location.pathname,
          });
        }
        hubspotServices.track(location.pathname);
      }
    }

    return true;
  }

  componentDidUpdate(prevProps) {
    this.handleHubspotChat(prevProps);
  }

  componentWillUnmount() {
    appSocketService.unsubscribe();
    window.removeEventListener('click', clickEvent.clickListener);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  handleHubspotChat = (prevProps) => {
    const { location } = this.props;
    const { location: prevLocation } = prevProps;
    const isRouterChange = location.pathname !== prevLocation.pathname;
    if (!isRouterChange) {
      return;
    }
    hubspotServices.trigger(location.pathname);
  };

  // eslint-disable-next-line class-methods-use-this
  handleBeforeUnload = () => {
    googleDriveEvent.totalPopupInSession();
    /**
     * Remove prevUrl pinpoint key in session storage
     * to avoid missing pageView events after refresh page
     * Source: https://github.com/aws-amplify/amplify-js/blob/d8f695a6697046de8ee8633916156a1b72421d39/packages/analytics/src/trackers/PageViewTracker.ts#L62
     */
    sessionStorage.removeItem(SESSION_STORAGE_KEY.AWS_PREV_URL_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY.PINPOINT_PREV_URL_KEY);
  };

  render() {
    return this.props.children;
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired,
  children: PropTypes.node,
};

App.defaultProps = {
  children: null,
};

export default App;
