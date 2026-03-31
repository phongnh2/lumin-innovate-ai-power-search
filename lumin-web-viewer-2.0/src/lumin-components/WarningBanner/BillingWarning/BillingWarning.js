import classNames from 'classnames';
import { Text, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import actions from 'actions';
import selectors from 'selectors';

import { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';

import { useEnableWebReskin, useTranslation } from 'hooks';
import useReactivateSubscription from 'hooks/useReactivateSubscription';
import { useRetrySubscription } from 'hooks/useRetrySubscription';
import { useThemeMode } from 'hooks/useThemeMode';
import { useTrackingBannerEvent } from 'hooks/useTrackingBannerEvent';
import { useViewerMatch } from 'hooks/useViewerMatch';

import paymentService from 'services/paymentService';

import { toastUtils } from 'utils';
import date from 'utils/date';
import { BannerName, BannerPurpose } from 'utils/Factory/EventCollection/BannerEventCollection';
import { getRedirectOrgUrl } from 'utils/orgUrlUtils';

import { WarningBannerType } from 'constants/banner';
import { ModalTypes } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { BillingWarningType, PAYMENT_DECLINED_CODE } from 'constants/paymentConstant';
import { PaymentTypes } from 'constants/plan';
import { Routers, ORG_ROUTES } from 'constants/Routers';
import { Colors } from 'constants/styles';
import { BASEURL } from 'constants/urls';

import styles from '../WarningBanner.module.scss';

import * as Styled from './BillingWarning.styled';

const propTypes = {
  type: PropTypes.oneOf(Object.values(PaymentTypes)).isRequired,
  clientId: PropTypes.string,
  renderClose: PropTypes.func,
};
const defaultProps = {
  clientId: null,
  renderClose: () => {},
};

const BillingWarning = ({ type, clientId, renderClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const themeMode = useThemeMode();
  const billings = useSelector(selectors.getBillingWarning, shallowEqual) || {};
  const {
    renewPayload: { attempt, metadata },
    warnings = [],
    subCancelPayload,
  } = billings[clientId];
  const { remainingDay: subscriptionRemainingDate, expireDate, metadata: subCancelMetaData } = subCancelPayload;
  const { declineCode, cardLast4 } = attempt || {};
  const organization = metadata?.organization || {};
  const { reactiveSubscription } = useReactivateSubscription();
  const { onRetry } = useRetrySubscription(clientId, type, { loading: true });
  const { trackBannerConfirmation, trackBannerDismiss } = useTrackingBannerEvent({
    bannerName: BannerName.BILLING_WARNING_IN_TOP_BANNER,
    bannerPurpose: BannerPurpose[BannerName.BILLING_WARNING_IN_TOP_BANNER],
  });
  const { isEnableReskin } = useEnableWebReskin();
  const redirectToBilling = getRedirectOrgUrl({
    orgUrl: organization.url,
    path: ORG_ROUTES.DASHBOARD_BILLING,
  });

  const firstWarning = warnings[0] || {};

  const handleClose = useCallback(async () => {
    try {
      await paymentService.closeBillingWarningBanner(clientId, firstWarning.type);
      trackBannerDismiss();
      dispatch(actions.deleteBillingBanner(clientId, firstWarning.type));
    } catch (e) {
      toastUtils.openToastMulti({
        message: t('viewer.billingWarning.failedToCloseTheBanner'),
        type: ModalTypes.ERROR,
      });
    }
  }, [clientId, dispatch, firstWarning.type]);

  const isCardIssues = (code) =>
    [
      PAYMENT_DECLINED_CODE.INSUFFICIENT_FUNDS,
      PAYMENT_DECLINED_CODE.EXPIRED_CARD,
      PAYMENT_DECLINED_CODE.RESTRICTED_CARD,
      PAYMENT_DECLINED_CODE.STOLEN_CARD,
      PAYMENT_DECLINED_CODE.PAYMENT_METHOD_NOT_FOUND,
    ].includes(code);

  const openSetting = () => {
    trackBannerConfirmation();
    if (type === PaymentTypes.INDIVIDUAL) {
      window.open(`${BASEURL}${Routers.SETTINGS.BILLING}`, '_blank');
      return;
    }
    navigate(`/${ORG_TEXT}/${organization.url}/dashboard/billing`);
  };

  const reactivateButtonProps =
    type === PaymentTypes.INDIVIDUAL
      ? {
          title: t('viewer.billingWarning.reactivate'),
          onClick: () => reactiveSubscription(type, clientId, subCancelMetaData),
        }
      : {
          title: t('unifyBillingSettings.manage'),
          onClick: () => navigate(redirectToBilling),
        };

  const getRenewAttemptContent = () => {
    const cardIssues = isCardIssues(declineCode);
    if (cardIssues) {
      if (isEnableReskin) {
        return (
          <>
            <Text
              className={styles.textContainer}
              type="title"
              size="sm"
              color="var(--kiwi-colors-surface-inverse-surface)"
            >
              {t('viewer.billingWarning.unableToRenewYourSubscription')}
            </Text>
            <Button
              variant="outlined"
              size="md"
              classNames={{
                root: styles.buttonOutline,
              }}
              onClick={openSetting}
            >
              {t('viewer.billingWarning.updatePaymentInformation')}
            </Button>
          </>
        );
      }
      return (
        <>
          <Styled.Text>{t('viewer.billingWarning.unableToRenewYourSubscription')}</Styled.Text>
          <Styled.ButtonGroup>
            <Styled.Button size={ButtonSize.XS} onClick={openSetting}>
              {t('viewer.billingWarning.updatePaymentInformation')}
            </Styled.Button>
          </Styled.ButtonGroup>
        </>
      );
    }

    if (isEnableReskin) {
      return (
        <>
          <Text
            className={styles.textContainer}
            type="title"
            size="sm"
            color="var(--kiwi-colors-surface-inverse-surface)"
          >
            {cardLast4
              ? t('viewer.billingWarning.unableToRenewWithGenericDeclineCard', { cardLast4 })
              : t('viewer.billingWarning.unableToRenewWithGenericDeclineAnother')}
          </Text>
          <div className={styles.buttonGroup}>
            <Button
              size="md"
              variant="outlined"
              classNames={{
                root: styles.buttonOutline,
              }}
              onClick={onRetry}
            >
              {t('viewer.billingWarning.tryAgain')}
            </Button>
            <Button
              size="md"
              variant="filled"
              classNames={{
                root: styles.buttonFilled,
              }}
              onClick={openSetting}
            >
              {t('viewer.billingWarning.updateInformation')}
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <Styled.Text>
          {cardLast4
            ? t('viewer.billingWarning.unableToRenewWithGenericDeclineCard', { cardLast4 })
            : t('viewer.billingWarning.unableToRenewWithGenericDeclineAnother')}
        </Styled.Text>
        <Styled.ButtonGroup $columns={2}>
          <Styled.Button $isOutline size={ButtonSize.XS} color={ButtonColor.SECONDARY_RED} onClick={openSetting}>
            {t('viewer.billingWarning.updateInformation')}
          </Styled.Button>
          <Styled.Button size={ButtonSize.XS} className="danger" onClick={onRetry}>
            {t('viewer.billingWarning.tryAgain')}
          </Styled.Button>
        </Styled.ButtonGroup>
      </>
    );
  };

  const getSubscriptionRemainingDateContent = () => {
    let remainingDateText = '';
    if (subscriptionRemainingDate === 0) {
      remainingDateText = t('viewer.billingWarning.orgSubscriptionWillEndToday');
    } else {
      remainingDateText = t('viewer.billingWarning.remainingDate', {
        count: subscriptionRemainingDate,
        subscriptionRemainingDate,
        expireDate: date.formatMDYTime(expireDate),
      });
    }
    const text =
      type === PaymentTypes.INDIVIDUAL
        ? t('viewer.billingWarning.individualSubscriptionWillEnd', { remainingDateText })
        : t('viewer.billingWarning.organizationSubscriptionWillEnd', { remainingDateText });

    if (isEnableReskin) {
      return (
        <>
          <Text
            className={styles.textContainer}
            type="title"
            size="sm"
            color="var(--kiwi-colors-surface-inverse-surface)"
          >
            {text}
          </Text>
          <Button
            size="md"
            variant="outlined"
            classNames={{
              root: styles.buttonOutline,
            }}
            onClick={reactivateButtonProps.onClick}
          >
            {reactivateButtonProps.title}
          </Button>
        </>
      );
    }
    return (
      <>
        <Styled.Text closable={firstWarning.closable}>{text}</Styled.Text>
        <Styled.ButtonGroup>
          <Styled.Button size={ButtonSize.XS} onClick={reactivateButtonProps.onClick}>
            {reactivateButtonProps.title}
          </Styled.Button>
        </Styled.ButtonGroup>
      </>
    );
  };

  const getContent = () => {
    const { type } = firstWarning;
    switch (type) {
      case BillingWarningType.RENEW_ATTEMPT: {
        return getRenewAttemptContent();
      }
      case BillingWarningType.SUBSCRIPTION_REMAINING_DATE: {
        return getSubscriptionRemainingDateContent();
      }
      default:
        return null;
    }
  };

  const content = getContent();

  const { isViewer } = useViewerMatch();
  const flag = isViewer;

  const themeWithModes = flag ? Styled.newLayoutTheme : Styled.theme;
  const theme = themeWithModes[themeMode];

  if (!content) {
    return null;
  }

  if (isEnableReskin) {
    return (
      <div className={classNames(styles.container, styles.lumin)}>
        <div className={styles.contentWrapper}>{content}</div>
        {firstWarning.closable &&
          Boolean(renderClose) &&
          renderClose({
            onClick: handleClose,
            customColor: 'var(--kiwi-colors-surface-inverse-surface)',
            isReskin: true,
            banner: WarningBannerType.BILLING_WARNING.value,
          })}
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Styled.Container background={Colors.SECONDARY_10} closable={firstWarning.closable}>
        {content}
        {firstWarning.closable &&
          Boolean(renderClose) &&
          renderClose({ onClick: handleClose, customColor: theme.closeButton })}
      </Styled.Container>
    </ThemeProvider>
  );
};

BillingWarning.propTypes = propTypes;
BillingWarning.defaultProps = defaultProps;

export default BillingWarning;
