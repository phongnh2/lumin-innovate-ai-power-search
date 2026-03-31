/* eslint-disable no-use-before-define */
import { useSubscription } from '@apollo/client';
import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import { CONVERT_TO_MAIN_ORGANIZATION_SUB, DELETE_ORGANIZATION_SUB } from 'graphQL/OrganizationGraph';

import actions from 'actions';
import selectors from 'selectors';

import { useNavigateUser, useTranslation } from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { organizationServices } from 'services';

import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_CONVERT_TYPE, ORG_TEXT } from 'constants/organizationConstants';
import { PaymentPlans } from 'constants/plan.enum';

const withUpdateOrganization = (Component) => (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const organization = useSelector(selectors.getCurrentOrganization, shallowEqual) || {};
  const { _id: organizationId } = organization.data;
  const { goToOrgListOrPersonalDocs } = useNavigateUser();

  const handleCheckHasActiveOrg = async () => {
    const orgs = await organizationServices.getOrgList();
    return orgs.some((org) => !org.organization.deletedAt);
  };

  useSubscription(DELETE_ORGANIZATION_SUB, {
    variables: {
      orgId: organizationId,
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { deleteOrganizationSub },
      },
    }) => {
      // eslint-disable-next-line no-use-before-define
      showModalWhenDeletedOrg(deleteOrganizationSub.organization);
    },
  });

  useSubscription(CONVERT_TO_MAIN_ORGANIZATION_SUB, {
    variables: {
      orgId: organizationId,
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { convertOrganization },
      },
    }) => {
      // eslint-disable-next-line no-use-before-define
      modalConvertedOrganization(convertOrganization);
    },
  });

  const url = useMatch(`/${ORG_TEXT}/:orgUrl/:tab/`);
  const handleConfirmConvertModal = (orgData) => {
    const { url: _url } = orgData;
    const { tab: _tab } = url.params;
    window.location.replace(`/${ORG_TEXT}/${_url}/${_tab}`);
  };

  const showModalWhenDeletedOrg = async (orgData) => {
    const isPremiumUser = currentUser.payment.type !== PaymentPlans.FREE;
    const hasActiveOrg = await handleCheckHasActiveOrg();
    const modalData = {
      title: t('orgPage.permissionIsExpired'),
      message: (
        <h3>
          <Trans
            i18nKey={
              hasActiveOrg || isPremiumUser ? 'orgPage.orgHasBeenDeleted' : 'orgPage.lastJoinedOrgHasBeenDeleted'
            }
            values={{ orgName: orgData.name }}
            components={{ b: <b /> }}
          />
        </h3>
      ),
      type: ModalTypes.WARNING,
      isFullWidthButton: true,
      confirmButtonTitle: t(hasActiveOrg || isPremiumUser ? 'common.ok' : 'common.exploreTheNewCircle'),
      onConfirm: () =>
        goToOrgListOrPersonalDocs({ forceReload: true, goToPersonalDocs: isPremiumUser && !hasActiveOrg }),
      className: 'OrganizationPage__CustomModal',
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
    };
    dispatch(actions.openModal(modalData));
  };

  const modalConvertedOrganization = (orgData) => {
    let i18nKey;
    switch (orgData.type) {
      case ORGANIZATION_CONVERT_TYPE.SUBSCRIPTION_CONVERT_TO_MAIN_ORGANIZATION:
        i18nKey = 'orgPage.convertedToMain';
        break;
      case ORGANIZATION_CONVERT_TYPE.SUBSCRIPTION_CONVERT_TO_CUSTOM_ORGANIZATION:
        i18nKey = 'orgPage.convertedToCustom';
        break;
      default:
        break;
    }

    const modalData = {
      title: t('common.permissionUpdate'),
      message: (
        <h3>
          <Trans i18nKey={i18nKey} components={{ b: <b /> }} />
        </h3>
      ),
      type: ModalTypes.WARNING,
      isFullWidthButton: true,
      confirmButtonTitle: t('common.reload'),
      onConfirm: () => handleConfirmConvertModal(orgData),
      className: 'OrganizationPage__CustomModal',
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
    };
    dispatch(actions.openModal(modalData));
  };

  return <Component {...props} />;
};

export default withUpdateOrganization;
