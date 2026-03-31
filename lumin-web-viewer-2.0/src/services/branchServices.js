/* eslint-disable class-methods-use-this */
import branchSDK from 'branch-sdk';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

const MOBILE_URL = 'app-staging.luminmobile.com/viewer';

class BranchService {

  exec(callback) {
    if (process.env.BRANCH_IO_KEY) {
      callback();
    }
  }

  init = (documentId, t) => this.exec(() => this.handleInit(documentId, t));

  addEventListener = (eventName, callback) => this.exec(() => this.handleAddEventListener(eventName, callback));

  removeEventListener = (callback) => this.exec(() => this.handleRemoveEventListener(callback));

  link = (documentId) => this.exec(() => this.handleLink(documentId));

  logout = () => this.exec(() => this.handleLogout());

  closeJourney = () => this.exec(() => this.handleCloseJourney());

  handleInit = (documentId, t) =>
    branchSDK.init(
      process.env.BRANCH_IO_KEY,
      {
        disable_entry_animation: true,
        disable_exit_animation: true,
    }, (err) => {
      if (err) {
        logger.logError({
          error: err,
          reason: LOGGER.Service.BRANCH_IO_ERROR,
        });
        return;
      }
      const desktopUrl = `${MOBILE_URL}/${documentId}${window.location.search}`;
      const deeplinkPath = `viewer/${documentId}${window.location.search}`;
      branchSDK.setBranchViewData({
        campaign: 'Mobile Browser Viewer - Download app banner',
        data: {
          '$desktop_url': desktopUrl,
          '$deeplink_path': deeplinkPath,
          '$journeys_title': t('viewer.mobileBanner.title'),
          '$journeys_description': t('viewer.mobileBanner.description'),
          '$journeys_button_cancel': t('viewer.mobileBanner.dismiss'),
          '$journeys_button_get_has_app': t('viewer.mobileBanner.openApp'),
          '$journeys_button_get_no_app': t('viewer.mobileBanner.openApp'),
        },
      });
    });

  handleAddEventListener = (eventName, callback) => {
    branchSDK.addListener(eventName, callback);
  };

  handleRemoveEventListener = (callback) => {
    branchSDK.removeListener(callback);
  };

  handleLink = async (documentId) =>
    new Promise((resolve, reject) => {
      branchSDK.link(
        {
          data: {
            $desktop_url: `${MOBILE_URL}/${documentId}`,
            $deeplink_path: `viewer/${documentId}`,
          },
        },
        (err, link) => {
          if (err) {
            logger.logError({
              error: err,
              reason: LOGGER.Service.BRANCH_IO_ERROR,
            });
            reject(err);
          }
          resolve(link);
        }
      );
    });

  handleLogout = () =>
    branchSDK.logout((err) => {
      if (err) {
        logger.logError({
          error: err,
          reason: LOGGER.Service.BRANCH_IO_ERROR,
        });
      }
    });

  handleCloseJourney = () =>
    branchSDK.closeJourney((err) => {
      if (err) {
        logger.logError({
          error: err,
          reason: LOGGER.Service.BRANCH_IO_ERROR,
        });
      }
    });
}

export const branchService = new BranchService();
