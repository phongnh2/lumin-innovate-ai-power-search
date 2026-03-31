import React from 'react';
import { Trans } from 'react-i18next';
import { batch, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import actions from 'actions';

import { useOneClickUpgradeContext } from 'HOC/withOneClickUpgrade';

import { useGetCurrentUser, useTranslation } from 'hooks';
import { SelectedMember } from 'hooks/useSignSeatModal';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import errorExtract from 'utils/error';
import { getFullPathWithPresetLang } from 'utils/getLanguage';
import { PaymentUrlSerializer } from 'utils/payment';
import toastUtils from 'utils/toastUtils';

import { ErrorCode } from 'constants/errorCode';
import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import { DEFAULT_SIGN_DOC_STACK } from 'constants/organizationConstants';
import { PERIOD, Plans } from 'constants/plan';
import { STATIC_PAGE_URL } from 'constants/urls';

import { IOrganization, UpdateSignWsPaymentActions } from 'interfaces/organization/organization.interface';
import { IPaymentMethod } from 'interfaces/payment/payment.interface';

interface SignSeatAssignmentConfig {
  userId: string;
  userName: string;
  organizationData: IOrganization;
  onAssignSuccess?: () => void;
  onOpenSignSeatModal?: (member: SelectedMember, orgId: string) => void;
  onRefetchList?: () => Promise<void>;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

interface SignSeatUnassignmentConfig {
  userId: string;
  userName: string;
  organizationData: IOrganization;
  onRefetchList?: () => Promise<void>;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

interface IUseSignSeatAssignment {
  isLoadingCard?: boolean;
  currentPaymentMethod?: IPaymentMethod;
}

export default function useSignSeatAssignment({ isLoadingCard, currentPaymentMethod }: IUseSignSeatAssignment = {}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useGetCurrentUser();
  const currentUserId = currentUser?._id;

  const { openOneClickUpgradeModal, skipNextNotification } = useOneClickUpgradeContext() || {};
  const primaryTextClassName = 'kiwi-message--primary';

  const openContactSalesModal = () => {
    dispatch(
      actions.openModal({
        useReskinModal: true,
        type: ModalTypes.INFO,
        title: t('common.contactSales'),
        message: <Trans i18nKey="unifyBillingSettings.contactSalesMessage" />,
        cancelButtonTitle: t('common.cancel'),
        confirmButtonTitle: t('unifyBillingSettings.contactSales'),
        onCancel: () => {
          dispatch(actions.closeModal());
        },
        closeOnConfirm: true,
        onConfirm: () => {
          window.open(`${STATIC_PAGE_URL}${getFullPathWithPresetLang(t('url.saleSupport.contactSale'))}`, '_blank');
        },
      })
    );
  };

  const redirectToPaymentPage = (userId: string, userName: string, orgId: string, paymentPeriod?: string) => {
    const customParams = new URLSearchParams({
      assign_member_id: userId,
      assign_member_name: userName,
      return_to: window.location.href,
    });
    const paymentUrl = new PaymentUrlSerializer()
      .of(orgId)
      .product(UnifySubscriptionProduct.SIGN)
      .period(paymentPeriod || PERIOD.MONTHLY.toLowerCase())
      .plan(UnifySubscriptionPlan.ORG_SIGN_PRO)
      .searchParam(customParams.toString())
      .get();
    navigate(paymentUrl);
  };

  const syncOrgDataAndRefreshList = (
    updatedOrgData: IOrganization,
    orgId: string,
    onRefetchList?: () => Promise<void>
  ) => {
    batch(() => {
      dispatch(actions.updateCurrentOrganization(updatedOrgData));
      dispatch(actions.updateOrganizationInList(orgId, updatedOrgData));
    });

    if (onRefetchList) {
      // eslint-disable-next-line no-void
      void onRefetchList();
    }
  };

  const showSeatOperationSuccessToast = (
    userName: string,
    availableSignSeats: number,
    action: UpdateSignWsPaymentActions
  ) => {
    const actionI18nKeyMap: Record<UpdateSignWsPaymentActions, string> = {
      [UpdateSignWsPaymentActions.ASSIGN_SEAT]: 'memberPage.luminSignSeat.assignSeatSuccess',
      [UpdateSignWsPaymentActions.UNASSIGN_SEAT]: 'memberPage.luminSignSeat.unassignSeatSuccess',
    };

    const i18nKey = actionI18nKeyMap[action];

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    toastUtils.openToastMulti({
      type: ModalTypes.SUCCESS,
      message: (
        <span>
          <Trans
            i18nKey={i18nKey}
            values={{
              name: userName,
              availableSignSeats,
              count: availableSignSeats,
            }}
            components={{ strong: <b className={primaryTextClassName} /> }}
          />
        </span>
      ),
    });
  };

  const handlePaymentSetupFlow = (
    userId: string,
    userName: string,
    orgId: string,
    paymentPeriod: string | undefined,
    isEnterprise: boolean,
    onLoadingStateChange?: (isLoading: boolean) => void
  ) => {
    if (isEnterprise) {
      openContactSalesModal();
    } else {
      redirectToPaymentPage(userId, userName, orgId, paymentPeriod);
    }
    onLoadingStateChange?.(false);
  };

  const handleAssignSeatError = (
    err: unknown,
    organizationData: IOrganization,
    userId: string,
    userName: string,
    onRefetchList?: () => Promise<void>
  ) => {
    const { code: errorCode } = errorExtract.extractGqlError(err);

    if (errorCode === ErrorCode.Org.USER_ALREADY_HAS_SEAT) {
      const updatedAvailableSeats = Math.max(0, organizationData.availableSignSeats - 1);
      const updatedOrgData = {
        ...organizationData,
        availableSignSeats: updatedAvailableSeats,
        isSignProSeat: userId === currentUserId || organizationData.isSignProSeat,
      };

      syncOrgDataAndRefreshList(updatedOrgData, organizationData._id, onRefetchList);
      showSeatOperationSuccessToast(userName, updatedAvailableSeats, UpdateSignWsPaymentActions.ASSIGN_SEAT);
    } else {
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        error: err,
        message: 'Failed to assign sign seat',
      });
    }
  };

  const handleAssignSeat = async (config: SignSeatAssignmentConfig) => {
    const { userId, userName, organizationData, onRefetchList, onLoadingStateChange } = config;

    try {
      onLoadingStateChange?.(true);

      const { availableSignSeats, totalSignSeats, payment, _id: orgId } = organizationData;
      const { type: paymentType } = payment || {};

      const isEnterprise = paymentType === Plans.ENTERPRISE;
      const isPaymentCardFetched = !isLoadingCard;
      const needsPaymentSetup = !currentPaymentMethod && isPaymentCardFetched && availableSignSeats === 0;

      if (!totalSignSeats || needsPaymentSetup) {
        handlePaymentSetupFlow(userId, userName, orgId, payment?.period, isEnterprise, onLoadingStateChange);
        return;
      }

      if (userId === currentUserId) {
        skipNextNotification();
      }

      if (!availableSignSeats) {
        openOneClickUpgradeModal?.({ id: userId, name: userName }, orgId);
        onLoadingStateChange?.(false);
        return;
      }

      const assignResponse = await organizationServices.assignSignSeats({ orgId, userIds: [userId] });
      const seatsAfterAssign = assignResponse?.data?.availableSignSeats ?? availableSignSeats;

      const updatedOrgData = {
        ...organizationData,
        totalSignSeats,
        availableSignSeats: seatsAfterAssign,
        isSignProSeat: userId === currentUserId || organizationData.isSignProSeat,
      };

      syncOrgDataAndRefreshList(updatedOrgData, orgId, onRefetchList);
      showSeatOperationSuccessToast(userName, seatsAfterAssign, UpdateSignWsPaymentActions.ASSIGN_SEAT);
      onLoadingStateChange?.(false);
    } catch (err) {
      onLoadingStateChange?.(false);
      handleAssignSeatError(err, organizationData, userId, userName, onRefetchList);
    }
  };

  const handleUnassignSeat = async (config: SignSeatUnassignmentConfig) => {
    const { userId, userName, organizationData, onRefetchList, onLoadingStateChange } = config;

    try {
      onLoadingStateChange?.(true);
      dispatch(
        actions.updateModalProperties({
          isProcessing: true,
        })
      );

      const { totalSignSeats, _id: orgId, signDocStackStorage } = organizationData;

      if (userId === currentUserId) {
        skipNextNotification();
      }

      const {
        data: { availableSignSeats: availableSignSeatsAfterUnassign },
      } = await organizationServices.unassignSignSeats({ orgId, userIds: [userId] });

      const updatedOrgData = {
        ...organizationData,
        totalSignSeats,
        availableSignSeats: availableSignSeatsAfterUnassign,
        isSignProSeat: userId === currentUserId ? false : organizationData.isSignProSeat,
        signDocStackStorage: {
          ...signDocStackStorage,
          totalStack: DEFAULT_SIGN_DOC_STACK,
        },
      };

      syncOrgDataAndRefreshList(updatedOrgData, orgId, onRefetchList);
      showSeatOperationSuccessToast(
        userName,
        availableSignSeatsAfterUnassign,
        UpdateSignWsPaymentActions.UNASSIGN_SEAT
      );
    } catch (err) {
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        error: err,
        message: 'Failed to unassign sign seat',
      });
    } finally {
      onLoadingStateChange?.(false);
      dispatch(actions.closeModal());
    }
  };

  return {
    handleAssignSeat,
    handleUnassignSeat,
  };
}
