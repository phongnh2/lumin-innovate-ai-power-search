import { TFunction } from 'i18next';
import React, { useState, useMemo } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import SematicIcon from 'assets/lumin-svgs/create-team-failed.svg';
import CreateTeamFailedImg from 'assets/reskin/images/ilustration-create-team-failed.png';

import actions from 'actions';

import { useEnableWebReskin } from 'hooks';

import { organizationServices } from 'services';

import { PaymentUtilities } from 'utils/Factory/Payment';

import { ModalTypes } from 'constants/lumin-common';
import { Plans } from 'constants/plan';
import { STATIC_PAGE_PRICING, ROUTE_MATCH } from 'constants/Routers';
import { MAX_FREE_TEAM, MAX_PREMIUM_TEAM } from 'constants/teamConstant';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IPayment } from 'interfaces/payment/payment.interface';
import { ITeam } from 'interfaces/team/team.interface';

import { useTabletMatch } from './useTabletMatch';
import { useTranslation } from './useTranslation';

function getCreateTeamModalData({
  userRole,
  teamCreationInfo,
  t,
  isTablet,
  isEnableReskin,
  url,
  navigate,
  payment,
}: {
  userRole: string;
  teamCreationInfo: { maxTeam: number };
  t: TFunction;
  isTablet: boolean;
  isEnableReskin: boolean;
  url: string;
  navigate: (path: string) => void;
  payment: IPayment;
}): Record<string, unknown> {
  if (teamCreationInfo.maxTeam !== MAX_FREE_TEAM) {
    return {
      type: ModalTypes.WARNING,
      title: t('teamModal.title'),
      message: t('teamModal.message', {
        maxPremiumTeam: MAX_PREMIUM_TEAM,
      }),
      confirmButtonTitle: t('teamModal.manageTeams'),
      onConfirm: () => {
        navigate(ROUTE_MATCH.TEAM_LIST.replace(':orgUrl', url));
      },
      cancelButtonTitle: t('action.close'),
      onCancel: () => {},
      closeOnConfirm: true,
      useReskinModal: true,
    };
  }

  let modalData: Record<string, unknown>;
  modalData = {
    title: t('teamListPage.upgradePlan'),
    message: t('teamListPage.upgradePlanMessage', {
      maxFreeTeam: MAX_FREE_TEAM,
    }),
    customIcon: <img src={SematicIcon} alt="modal_image" width={isTablet ? 222 : 180} />,
    isFullWidthButton: true,
    confirmButtonTitle: t('common.ok').toUpperCase(),
    useReskinModal: true,
    confirmButtonProps: {
      withExpandedSpace: true,
    },
    ...(isEnableReskin && {
      titleCentered: true,
      Image: <img src={CreateTeamFailedImg} alt="modal_image" width={107} height={84} style={{ display: 'block' }} />,
      isFullWidthButton: false,
    }),
  };

  const isManager = organizationServices.isManager(userRole);
  const paymentUtilities = new PaymentUtilities(payment);
  const isUnifyPlan = paymentUtilities.isUnifyFree();
  if (isManager || isUnifyPlan) {
    modalData = {
      ...modalData,
      confirmButtonProps: {},
      message: t('teamListPage.adminUpgradePlanMessage', {
        maxFreeTeam: MAX_FREE_TEAM,
      }),
      confirmButtonTitle: t('common.learnMore'),
      cancelButtonTitle: t('common.cancel'),
      onCancel: () => {},
      onConfirm: () => window.open(STATIC_PAGE_PRICING, '_self'),
    };
  }
  return modalData;
}

const useCreateTeam = (currentOrganization: IOrganization) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isTablet = useTabletMatch();
  const { isEnableReskin } = useEnableWebReskin();
  const navigate = useNavigate();

  const { _id: orgId, teams, totalTeam, payment, userRole, url } = currentOrganization || {};
  const [openCreateTeamModal, setOpenCreateTeamModal] = useState<boolean>(false);
  const _toggleCreateModal = () => setOpenCreateTeamModal((prevState) => !prevState);

  const teamCreationInfo = useMemo(() => {
    const isNotFreePlan = payment?.type !== Plans.FREE;
    const maxTeam = isNotFreePlan ? MAX_PREMIUM_TEAM : MAX_FREE_TEAM;
    return {
      canCreate: totalTeam < maxTeam,
      maxTeam,
    };
  }, [payment?.type, totalTeam]);

  const onCreateTeamClick = () => {
    if (teamCreationInfo.canCreate) {
      setOpenCreateTeamModal(true);
      return;
    }
    const modalData = getCreateTeamModalData({
      userRole,
      teamCreationInfo,
      t,
      isTablet,
      isEnableReskin,
      url,
      navigate,
      payment,
    });
    dispatch(actions.openModal(modalData));
  };

  const onCreateTeam = (newTeam: ITeam) => {
    const newTeamList = [newTeam, ...teams];
    batch(() => {
      dispatch(
        actions.updateOrganizationInList(orgId, {
          teams: newTeamList,
        })
      );
      dispatch(actions.updateCurrentOrganization({ teams: newTeamList, totalTeam: totalTeam + 1 }));
    });
  };

  return {
    onClose: _toggleCreateModal,
    onCreate: onCreateTeam,
    openCreateTeamModal,
    onCreateTeamClick,
  };
};

export default useCreateTeam;
