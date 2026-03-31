import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import actions from 'actions';

import { useFetchPaymentCard, useGetCurrentUser, useTranslation } from 'hooks';
import useSignSeatAssignment from 'hooks/useSignSeatAssignment';

import logger from 'helpers/logger';

import { OrganizationUtilities } from 'utils/Factory/Organization';
import { PaymentUrlSerializer } from 'utils/payment';

import { IPaymentCardInfo } from 'features/BillingModal/constants/billingModal';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { LOGGER } from 'constants/lumin-common';
import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import RequestUpgradeForm from '../components/RequestUpgradeForm';

interface IUseUpgradeSignSeat {
  isRequestUpgradeSignSeat: boolean;
  isUpgradeSignSeat: boolean;
  organization: IOrganization;
}

interface IUseUpgradeSignSeatReturn {
  handleSignUpgradeClick: () => Promise<void>;
  isAssigning: boolean;
}

export const useUpgradeSignSeat = ({
  isRequestUpgradeSignSeat,
  isUpgradeSignSeat,
  organization,
}: IUseUpgradeSignSeat): IUseUpgradeSignSeatReturn => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isRequestUpgradeModalOpen, setIsRequestUpgradeModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const currentUser = useGetCurrentUser();
  const organizationUtilities = new OrganizationUtilities({ organization });
  const isManager = organizationUtilities.isManager();

  const { currentPaymentMethod, isLoading: isLoadingCard } = useFetchPaymentCard({
    clientId: isManager ? organization._id : undefined,
  }) as IPaymentCardInfo;

  const { handleAssignSeat: assignSeat } = useSignSeatAssignment({
    isLoadingCard,
    currentPaymentMethod,
  });

  const openRequestUpgradeModal = (): void => {
    if (isRequestUpgradeModalOpen) {
      return;
    }

    const modalSetting = {
      title: t('profileButton.requestUpgrade.title'),
      message: <RequestUpgradeForm organization={organization} />,
      hideDefaultButtons: true,
      useReskinModal: true,
      closeOnClickOutside: false,
      closeOnEscape: false,
      onClose: () => {
        setIsRequestUpgradeModalOpen(false);
      },
    };

    setIsRequestUpgradeModalOpen(true);
    dispatch(actions.openModal(modalSetting));
  };

  const handleSignUpgradeClick = async (): Promise<void> => {
    if (isRequestUpgradeSignSeat) {
      openRequestUpgradeModal();
      return;
    }

    if (isUpgradeSignSeat) {
      try {
        await assignSeat({
          userId: currentUser._id,
          userName: currentUser.name,
          organizationData: organization,
          onLoadingStateChange: setIsAssigning,
        });

        window.dispatchEvent(
          new CustomEvent(CUSTOM_EVENT.REFETCH_ORG_MEMBER, {
            detail: {
              organizationId: organization._id,
            },
          })
        );
      } catch (err) {
        logger.logError({
          reason: LOGGER.Service.GRAPHQL_ERROR,
          error: err,
          message: 'Failed to assign sign seat',
        });
      }

      return;
    }

    if (organization) {
      const serializer = new PaymentUrlSerializer();
      const url = serializer
        .of(organization._id)
        .product(UnifySubscriptionProduct.SIGN)
        .plan(UnifySubscriptionPlan.ORG_SIGN_PRO)
        .returnUrlParam()
        .get();

      navigate(url);
    }
  };

  return {
    handleSignUpgradeClick,
    isAssigning,
  };
};
