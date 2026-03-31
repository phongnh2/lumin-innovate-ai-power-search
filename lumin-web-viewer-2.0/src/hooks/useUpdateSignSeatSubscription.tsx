import { useSubscription } from '@apollo/client';
import React from 'react';
import { Trans } from 'react-i18next';
import { batch, useDispatch } from 'react-redux';

import { UPDATE_CONTRACT_STACK_SUBSCRIPTION, UPDATE_SIGN_SEAT_SUBSCRIPTION } from 'graphQL/OrganizationGraph';

import actions from 'actions';

import { useGetCurrentOrganization, useTranslation } from 'hooks';

import logger from 'helpers/logger';

import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { STATIC_PAGE_URL } from 'constants/urls';

import { ISignDocStackStorage, UpdateSignWsPaymentActions } from 'interfaces/organization/organization.interface';

interface SignSeatSubscriptionPayload {
  action: UpdateSignWsPaymentActions;
}

export default function useUpdateSignSeatSubscription(
  shouldIgnoreNextNotification?: React.MutableRefObject<boolean>
): void {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentOrg = useGetCurrentOrganization();
  const { _id: orgId, name: organizationName } = currentOrg || {};

  const SIGN_SEAT_MODAL_CONFIG = {
    [UpdateSignWsPaymentActions.ASSIGN_SEAT]: {
      type: ModalTypes.SUCCESS,
      title: t('memberPage.luminSignSeat.assignSeatNotificationTitle'),
      message: (
        <Trans
          i18nKey="memberPage.luminSignSeat.assignSeatNotificationDesc"
          values={{ organizationName }}
          components={{
            strong: <b className="kiwi-message--primary" />,
            a: (
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              <a
                style={{ color: 'var(--color-lumin-sign-on-surface-variant)', textDecoration: 'underline' }}
                aria-label="Lumin Sign Pricing Page"
                href={`${STATIC_PAGE_URL}/pricing/luminsign`}
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            br: <br />,
          }}
        />
      ),
    },
    [UpdateSignWsPaymentActions.UNASSIGN_SEAT]: {
      type: ModalTypes.INFO,
      title: t('memberPage.luminSignSeat.unassignSeatNotificationTitle'),
      message: (
        <Trans
          i18nKey="memberPage.luminSignSeat.unassignSeatNotificationDesc"
          values={{ organizationName }}
          components={{
            strong: <b className="kiwi-message--primary" />,
          }}
        />
      ),
    },
  };

  const showReloadSignSeat = (
    action: UpdateSignWsPaymentActions.ASSIGN_SEAT | UpdateSignWsPaymentActions.UNASSIGN_SEAT
  ): void => {
    const config = SIGN_SEAT_MODAL_CONFIG[action];

    dispatch(actions.closeModal());
    dispatch(
      actions.openModal({
        useReskinModal: true,
        type: config.type,
        title: config.title,
        message: config.message,
        closeOnConfirm: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        confirmButtonTitle: t('common.reload'),
        onConfirm: () => {
          window.location.reload();
        },
      })
    );
  };

  const handleSubscriptionUpdate = (action: UpdateSignWsPaymentActions): void => {
    if (shouldIgnoreNextNotification?.current) {
      shouldIgnoreNextNotification.current = false;
      return;
    }

    switch (action) {
      case UpdateSignWsPaymentActions.ASSIGN_SEAT:
      case UpdateSignWsPaymentActions.UNASSIGN_SEAT:
        showReloadSignSeat(action);
        break;

      default:
        break;
    }
  };

  useSubscription<{ updateSignSeatSubscription: SignSeatSubscriptionPayload }>(UPDATE_SIGN_SEAT_SUBSCRIPTION, {
    variables: { orgId },
    skip: !orgId,
    onSubscriptionData: ({ subscriptionData }) => {
      const payload = subscriptionData.data?.updateSignSeatSubscription;

      if (payload) {
        handleSubscriptionUpdate(payload.action);
      }
    },
    onError: (error) => {
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        error,
        message: 'Failed to update sign seat subscription',
      });
    },
  });

  useSubscription<{ updateContractStackSubscription: ISignDocStackStorage }>(UPDATE_CONTRACT_STACK_SUBSCRIPTION, {
    variables: { orgId },
    skip: !orgId,
    onSubscriptionData: ({ subscriptionData }) => {
      const signDocStackStorage = subscriptionData.data?.updateContractStackSubscription;
      batch(() => {
        dispatch(
          actions.updateCurrentOrganization({
            ...currentOrg,
            signDocStackStorage,
          })
        );
        dispatch(
          actions.updateOrganizationInList(orgId, {
            ...currentOrg,
            signDocStackStorage,
          })
        );
      });
    },
    onError: (error) => {
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        error,
        message: 'Failed to update sign upload agreement subscription',
      });
    },
  });
}
