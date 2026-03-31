/* eslint-disable sonarjs/no-small-switch */
import get from 'lodash/get';
import React, { useCallback, useEffect, useRef } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { matchPath, useNavigate, useLocation } from 'react-router';
import { useLatest } from 'react-use';

import { socket } from 'src/socket';

import actions from 'actions';
import selectors from 'selectors';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { authServices, userServices } from 'services';
import { kratosService } from 'services/oryServices';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';

import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { ORG_PATH, ORG_TEXT } from 'constants/organizationConstants';
import { Plans } from 'constants/plan';
import { Routers } from 'constants/Routers';
import { SOCKET_ON } from 'constants/socketConstant';
import { RatingModalStatus, USER_SUBSCRIPTION_TYPE } from 'constants/userConstants';

export function useUpdateUserSubscription() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const subscriptionRef = useRef();
  const pathname = useLatest(location.pathname);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const currentUserRef = useLatest(currentUser);
  const userPaymentType = useLatest(get(currentUser, 'payment.type', Plans.FREE));

  const { isEnableReskin } = useEnableWebReskin();

  const onCancelSubscription = useCallback(
    (user) => {
      const isOrgPath = matchPath({
        path: ORG_PATH,
        end: false,
      }, pathname.current);
      const isPaymentPage = matchPath({
        path: Routers.PAYMENT,
      }, pathname.current);
      const isSamePlan = userPaymentType === user.payment.type;
      if (!isOrgPath && !isSamePlan && !isPaymentPage) {
        const settings = {
          type: ModalTypes.WARNING,
          title: t('common.permissionUpdate'),
          message: t('userSubscription.subscriptionCanceled'),
          isFullWidthButton: true,
          confirmButtonTitle: t('common.reload'),
          onConfirm: () => window.location.reload(),
          disableBackdropClick: true,
          disableEscapeKeyDown: true,
        };
        dispatch(actions.openModal(settings));
      } else {
        dispatch(actions.updateCurrentUser(user));
      }
    },
    [dispatch]
  );

  const onConfirmLogout = async () => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
      })
    );
    try {
      await kratosService.signOut(() => {
        logger.logInfo({
          message: LOGGER.EVENT.SIGN_OUT,
          reason: LOGGER.Service.KRATOS_INFO,
        });
        authServices.afterSignOut();
      }, true);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.KRATOS_ERROR,
        error,
      });
      toastUtils.error({
        message: t('errorMessage.signoutFailed'),
      });
    } finally {
      dispatch(
        actions.updateModalProperties({
          isProcessing: false,
        })
      );
    }
  };

  const onUserEmailChanged = ({ newEmail }) => {
    const settings = {
      type: ModalTypes.WARNING,
      title: t('emailChangedModal.title'),
      message:
        newEmail === currentUser.email ? (
          t('modalSessionExpired.message')
        ) : (
          <Trans
            i18nKey="emailChangedModal.message"
            components={{
              b: <b className="kiwi-message--primary" />,
            }}
            values={{ email: newEmail }}
          />
        ),
      confirmButtonProps: {
        withExpandedSpace: true,
      },
      confirmButtonTitle: t('common.ok'),
      onConfirm: onConfirmLogout,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      useReskinModal: true,
    };
    dispatch(actions.openModal(settings));
  };

  const onMigratedPersonalDocuments = useCallback(
    ({ user, metadata }) => {
      const isPaymentPage = matchPath({
        path: Routers.PAYMENT,
      }, pathname.current);
      const settings = {
        type: ModalTypes.WARNING,
        title: t('common.permissionUpdate'),
        message: t('userSubscription.migrateDocumentDesc'),
        isFullWidthButton: !isEnableReskin,
        confirmButtonTitle: t('userSubscription.navigateToPersonalDocBtn'),
        onConfirm: () => {
          dispatch(actions.updateCurrentUser(user));
          navigate(`/${ORG_TEXT}/${metadata.migratedOrg.url}`);
        },
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        useReskinModal: true,
      };
      if (!isPaymentPage) {
        dispatch(actions.openModal(settings));
      } else {
        dispatch(actions.updateCurrentUser(user));
      }
    },
    [dispatch, navigate, isEnableReskin]
  );

  const openForceLogoutModal = () => {
    const settings = {
      type: ModalTypes.WARNING,
      title: t('orgDashboardSecurity.modalGoogleSignIn.forceLogInAgain.title'),
      message: (
        <Trans
          i18nKey="orgDashboardSecurity.modalGoogleSignIn.forceLogInAgain.message"
          components={{ b: <b /> }}
          values={{ email: currentUser.email }}
        />
      ),
      isFullWidthButton: true,
      confirmButtonTitle: t('orgDashboardSecurity.logInAgain'),
      onConfirm: onConfirmLogout,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
    };
    dispatch(actions.openModal(settings));
  };

  const subscribeUpdateUser = useCallback(
    ({ type, user, metadata }) => {
      switch (type) {
        case USER_SUBSCRIPTION_TYPE.CANCELED_SUBSCRIPTION:
          onCancelSubscription(user);
          break;
        case USER_SUBSCRIPTION_TYPE.SHOW_RATING_MODAL: {
          dispatch(
            actions.updateCurrentUser({
              metadata: { rating: { googleModalStatus: RatingModalStatus.OPEN } },
            })
          );
          break;
        }
        case USER_SUBSCRIPTION_TYPE.MIGRATING_SUCCESS: {
          dispatch(actions.fetchOrganizations());
          onMigratedPersonalDocuments({ user, metadata });
          break;
        }
        default:
          break;
      }
    },
    [dispatch, onCancelSubscription, onMigratedPersonalDocuments]
  );

  useEffect(() => {
    if (currentUserRef.current) {
      subscriptionRef.current = userServices.updateUserSubscription({
        onNext: subscribeUpdateUser,
        onError: (e) => {
          logger.logError({ message: e.message, error: e });
        },
      });
    }
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [subscribeUpdateUser]);

  useEffect(() => {
    socket.on(SOCKET_ON.ENABLE_GOOGLE_SIGN_IN_SUCCESS, openForceLogoutModal);
    socket.on(SOCKET_ON.USER_EMAIL_CHANGED, onUserEmailChanged);

    return () => {
      socket.removeListener({ message: SOCKET_ON.ENABLE_GOOGLE_SIGN_IN_SUCCESS });
      socket.removeListener({ message: SOCKET_ON.USER_EMAIL_CHANGED });
    };
  }, []);
}
