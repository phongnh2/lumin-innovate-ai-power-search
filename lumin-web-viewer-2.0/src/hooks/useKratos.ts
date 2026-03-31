/* eslint-disable no-void */
import axios from 'axios';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, useMatch, useParams } from 'react-router';

import actions from 'actions';

import { oneDriveLoader } from 'navigation/Router/setupOnedriveClient';
import timeTracking from 'screens/Viewer/time-tracking';

import useRedirectUserInvitation from 'hooks/useRedirectUserInvitation';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { userServices } from 'services';
import authServices from 'services/authServices';
import { kratosService } from 'services/oryServices';

import { autoTurnOnAutoCompleteToggle } from 'helpers/autoTurnOnAutoCompleteToggle';
import { cookieManager } from 'helpers/cookieManager';
import logger from 'helpers/logger';
import { matchPaths } from 'helpers/matchPaths';

import { errorUtils, eventTracking, LocalStorageUtils, validator } from 'utils';
import { isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';
import { redirectFlowUtils } from 'utils/redirectFlow';
import SessionUtils from 'utils/session';

import { CNCUserEvent } from 'features/CNC/constants/events/user';
import { injectOnedriveToken } from 'features/Document/utils/injectOnedriveToken';

import { IN_FLOW, REFERER } from 'constants/commonConstant';
import { CookieStorageKey } from 'constants/cookieName';
import { ErrorCode } from 'constants/errorCode';
import { STATUS_CODE } from 'constants/lumin-common';
import { NEW_AUTH_FLOW_ROUTE, ROUTE_MATCH, Routers as RoutersConstants } from 'constants/Routers';
import { GET_ME } from 'constants/timeTracking';
import { FORWARDED_FLP_URL_PARAMS, RedirectFromPage, UrlSearchParam } from 'constants/UrlSearchParam';

import { VerifyInvitationTokenPayload } from 'interfaces/user/user.interface';

const redirectList = [
  RoutersConstants.INVITATION_MAIL,
  RoutersConstants.PAYMENT,
  RoutersConstants.TRIAL_SIGNUP,
  RoutersConstants.OPEN_DRIVE,
  RoutersConstants.TRIAL_SIGNIN,
  RoutersConstants.OPEN_FORM,
  RoutersConstants.CREATE_EXTERNAL_PDF,
  RoutersConstants.VIEWER_TEMP_EDIT_EXTERNAL_PDF,
  ...Object.values(NEW_AUTH_FLOW_ROUTE),
];

export type TReturn = () => Promise<void>;

export const useKratos = (): TReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { redirect, canRedirect, isCircleInvitation } = useRedirectUserInvitation();

  const urlParams = new URLSearchParams(location.search);

  const invitationToken = urlParams.get(UrlSearchParam.TOKEN);
  const isGuestPath = useMatch('/viewer/guest/:documentId');
  const { isViewer } = useViewerMatch();
  const isFromEmail = urlParams.get(UrlSearchParam.REFERER) === REFERER.EMAIL;
  const isOpenFormFromTemplates = urlParams.get(UrlSearchParam.FROM_PAGE) === RedirectFromPage.TEMPLATES;
  const isCreateExternalPdfRoute = Boolean(useMatch({ path: ROUTE_MATCH.CREATE_EXTERNAL_PDF, end: false }));
  const isTempEditExternalPdfRoute = Boolean(useMatch({ path: ROUTE_MATCH.VIEWER_TEMP_EDIT_EXTERNAL_PDF, end: false }));
  const isExternalPdfFlow = isCreateExternalPdfRoute || isTempEditExternalPdfRoute;
  const canJoinPaidCircle = urlParams.get(UrlSearchParam.CAN_JOIN_WORKSPACE) === 'true';
  const { documentId } = useParams();

  const getOnedriveToken = async () => {
    const isFromOpenFileFlow = cookieManager.get(CookieStorageKey.IN_FLOW) === IN_FLOW.ONEDRIVE;
    if (isFromOpenFileFlow) {
      const accessTokenData = await userServices.getOnedriveToken();
      const accessTokenCookie = cookieManager.get(CookieStorageKey.ONEDRIVE_KEY);
      if (accessTokenCookie && accessTokenData) {
        injectOnedriveToken(accessTokenData);
      }
      oneDriveLoader.notify('access_token_loaded');
    }
  };

  return useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [{ tokenized }, invitationRes] = await Promise.all([
        kratosService.toSession(),
        invitationToken &&
          authServices
            .verifyNewUserInvitationToken(invitationToken)
            .then((data) => data)
            .catch<VerifyInvitationTokenPayload>(() => null),
      ]);
      SessionUtils.setAuthorizedToken(tokenized);
      dispatch(actions.setIsAuthenticating(false));
      if (isViewer || isGuestPath) {
        timeTracking.register(GET_ME);
      }
      const [res] = await Promise.all([
        authServices.getMe({
          invitationToken,
          skipOnboardingFlow: (isViewer && isFromEmail) || isOpenFormFromTemplates || isExternalPdfFlow,
        }),
        getOnedriveToken().catch(() => {}),
      ]);
      if (isViewer || isGuestPath) {
        timeTracking.finishTracking(GET_ME);
      }
      const { user } = res.data.getMe;
      autoTurnOnAutoCompleteToggle(user._id).catch((err) =>
        logger.logError({
          message: 'Failed to auto turn on autocomplete toggle',
          error: err,
        })
      );
      if (isViewer) {
        await authServices.onPostAuthenticationForViewer(user);
        const isEducation = validator.validateDomainEducation(user.email);
        if (canJoinPaidCircle && !isEducation) {
          navigate(NEW_AUTH_FLOW_ROUTE.JOIN_ORGANIZATION_FROM_OPEN_DRIVE, { replace: true, state: { documentId } });
        }
      } else {
        await authServices.onPostAuthentication(user);
      }
      // TODO: Handle checkingEnableOffline
      if (invitationRes && canRedirect(invitationRes.status)) {
        if (isCircleInvitation(invitationRes.type)) {
          eventTracking(CNCUserEvent.ACCEPT_INVITATION_FROM_EMAIL, {
            invitationId: invitationRes?.metadata?.invitationId,
            orgId: invitationRes.metadata.orgId,
          }).catch(() => {});
        }
        redirect(user, invitationRes);
        return;
      }
      // We only need to check the first time. Code is moved from Router.
      const isExceptPage = matchPaths(
        Object.values(redirectList).map((route) => ({
          path: route,
          end: false,
        })),
        location.pathname
      );

      if (isUserInNewAuthenTestingScope(user) && !isExceptPage) {
        const entriesParam = Array.from(urlParams.entries());
        const newAuthorizeParams = new URLSearchParams();

        const hasReturnToParam = entriesParam.some(([queryKey]) => queryKey === UrlSearchParam.RETURN_TO);

        if (!hasReturnToParam && entriesParam.length) {
          entriesParam.forEach(([key, value]) => {
            if (FORWARDED_FLP_URL_PARAMS.includes(key)) {
              newAuthorizeParams.append(key, value);
            }
          });
        }
        const authUrl = authServices.getNewAuthenRedirectUrl(user).url;

        const redirectUserInNewAuthenUrl = `${authUrl}/?${newAuthorizeParams.toString()}`;
        navigate(redirectUserInNewAuthenUrl, { replace: true });
      }
    } catch (e) {
      const { code, metadata } = errorUtils.extractGqlError(e) as { code: string; metadata: Record<string, string> };
      if (code === ErrorCode.Org.MEMBERSHIP_NOT_FOUND) {
        dispatch(actions.setMembershipOfOrg({ require: true, email: metadata?.email }));
        return;
      }
      dispatch(actions.setIsAuthenticating(false));
      dispatch(actions.setIsCompletedGettingUserData(true));
      authServices.setupSocketForAnonymous();
      if (!isGuestPath && axios.isAxiosError(e) && e.response?.status === STATUS_CODE.UNAUTHORIZED) {
        LocalStorageUtils.clear();
        redirectFlowUtils.deleteCookies();
      }
    }
  }, []);
};
