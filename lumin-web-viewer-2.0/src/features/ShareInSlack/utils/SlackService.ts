import { v4 as uuid } from 'uuid';

import { initSlackOAuth } from 'services/graphServices/slack';

import logger from 'helpers/logger';

import { socket } from '@socket';

import { LOGGER } from 'constants/lumin-common';
import { SOCKET_ON } from 'constants/socketConstant';
import { AXIOS_BASEURL } from 'constants/urls';

import popupWindowParams from './popupWindowParams';
import { SlackOAuthErrorType } from '../constants';

const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 900;

class SlackService {
  private readonly windowName = uuid();

  private popupWindow?: WindowProxy;

  private onSuccess?: ({ teamId }: { teamId?: string }) => void;

  private onError?: ({ errorType }: { errorType: SlackOAuthErrorType }) => void;

  private flowId?: string;

  handle = ({
    flowId,
    isOk,
    errorType,
    teamId,
  }: {
    flowId: string;
    isOk: boolean;
    errorType?: string;
    teamId?: string;
  }) => {
    if (flowId !== this.flowId) {
      return;
    }
    if (!this.popupWindow) {
      return;
    }
    this.popupWindow.close();
    this.popupWindow = undefined;
    socket.removeListener({ message: SOCKET_ON.SLACK_OAUTH_FLOW_COMPLETED, listener: this.handle });
    if (isOk) {
      this.onSuccess?.({ teamId });
    } else {
      this.onError?.({ errorType: errorType as SlackOAuthErrorType });
    }
  };

  async getConsent({
    onSuccess,
    onError,
  }: {
    onSuccess: ({ teamId }: { teamId?: string }) => void;
    onError: ({ errorType }: { errorType: SlackOAuthErrorType }) => void;
  }) {
    try {
      const { contextJwt, flowId } = await initSlackOAuth();
      const consentUrl = `${AXIOS_BASEURL}/slack/oauth/redirect?jwt=${contextJwt}`;

      this.flowId = flowId;
      this.onSuccess = onSuccess;
      this.onError = onError;
      socket.on(SOCKET_ON.SLACK_OAUTH_FLOW_COMPLETED, this.handle);

      const popupWindow = window.open(consentUrl, this.windowName, popupWindowParams(POPUP_WIDTH, POPUP_HEIGHT));

      if (popupWindow) {
        this.popupWindow = popupWindow;
      }
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.SHARE_IN_SLACK,
        error: error as Error,
        message: 'Error getting consent',
      });
    }
  }
}

const slackService = new SlackService();
export default slackService;
