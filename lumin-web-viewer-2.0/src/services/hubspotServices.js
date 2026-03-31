/**
 * https://developers.hubspot.com/docs/api/conversation/chat-widget-sdk
 */

import get from 'lodash/get';

import { isMatchOrgDashboard } from 'utils/orgUtils';

import { Routers } from 'constants/Routers';

const REFRESH_TIMEOUT = 1000;
class HubSpotService {
  isLoaded() {
    return this.getHubspotConversations() && get(this.getHubspotConversations(), 'widget.status().loaded', false);
  }

  load() {
    this.excute(() => this.loadWidget());
  }

  remove() {
    this.excute(() => this.removeWidget());
  }

  clear() {
    this.excute(() => this.clearWidget());
  }

  trigger(pathname) {
    const isSettingOrPlan = [Routers.PLANS, ...Object.values(Routers.SETTING)].includes(pathname);
    const isOrgDashboard = isMatchOrgDashboard(pathname);
    if (isSettingOrPlan || isOrgDashboard) {
      this.handleOnSettingOrPlanPage();
    } else {
      this.handleOnNotPlanPage();
    }
  }

  identity(email) {
    this.excute(() => {
      if (this.getHsq()) {
        this.getHsq().push([
          'identify',
          {
            email,
          },
        ]);
      }
    });
  }

  track(pathname) {
    this.excute(() => {
      if (this.getHsq()) {
        this.getHsq().push(['setPath', pathname]);
        this.getHsq().push(['trackPageView']);
      }
    });
  }

  refresh() {
    this.excute(() => this.refreshWidget());
  }

  refreshWidgetWithTimeout() {
    setTimeout(() => {
      this.refresh();
    }, REFRESH_TIMEOUT);
  }

  /**
   * private method
   */
  loadWidget() {
    this.getHubspotConversations().widget.load();
  }

  /**
   * private method
   */
  removeWidget() {
    this.getHubspotConversations().widget.remove();
  }

  /**
   * private method
   */
  clearWidget() {
    this.getHubspotConversations().clear({ resetWidget: true });
  }

  /**
   * private method
   */
  refreshWidget() {
    this.getHubspotConversations().widget.refresh();
  }

  /**
   * private method
   */
  handleOnSettingOrPlanPage() {
    if (!this.isLoaded()) {
      this.load();
    }
  }

  /**
   * private method
   */
  handleOnNotPlanPage() {
    this.remove();
  }

  /**
   * private method
   */
  // eslint-disable-next-line class-methods-use-this
  getHsq() {
    return window._hsq;
  }

  /**
   * private method
   */
  // eslint-disable-next-line class-methods-use-this
  getHubspotConversations() {
    return window.HubSpotConversations;
  }

  /**
   * private method
   */
  excute(callback) {
    /*
      If external API methods are already available, use them.
    */
    if (this.getHubspotConversations()) {
      callback();
    } else {
      /*
        Otherwise, callbacks can be added to the hsConversationsOnReady on the window object.
        These callbacks will be called once the external API has been initialized.
      */
      window.hsConversationsOnReady = [callback];
    }
  }
}

const hubSpotService = new HubSpotService();

export default hubSpotService;
