import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_MAX_MEMBERS } from 'constants/organizationConstants';
import { PLAN_TYPE_LABEL } from 'constants/plan';
import { STATIC_PAGE_URL } from 'constants/urls';

const openBlockedByUpgradingSetting = ({ openModal, t, metadata }) => {
  openModal({
    type: ModalTypes.WARNING,
    title: t('common.warning'),
    message: <Trans i18nKey="modalChangingPlan.message" values={{ plan: PLAN_TYPE_LABEL[metadata.plan] }} />,
    confirmButtonTitle: t('common.ok'),
  });
};

const openLimitedOrgMembersModal = ({ currentOrganization, openModal, t }) => {
  openModal({
    type: ModalTypes.WARNING,
    title: t('memberPage.addMemberModal.unableToInviteMembers'),
    message: (
      <Trans
        i18nKey="memberPage.addMemberModal.messageWarningContactSale"
        components={{ b: <b /> }}
        values={{ name: currentOrganization.name, members: ORGANIZATION_MAX_MEMBERS }}
      />
    ),

    cancelButtonTitle: t('common.cancel'),
    confirmButtonTitle: t('common.contactSales'),
    onCancel: () => {},
    onConfirm: () => window.open(STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale'))),
    useReskinModal: true,
  });
};

const openFailedWhenInvite = ({ openModal, t }) => {
  openModal({
    type: ModalTypes.ERROR,
    title: t('common.fail'),
    message: t('memberPage.addMemberModal.messageInviteFailed'),
    cancelButtonTitle: t('common.cancel'),
    confirmButtonTitle: t('common.reloadNow'),
    onCancel: () => {},
    onConfirm: () => window.location.reload(),
  });
};

const withAddMemberHOC = (WrappedComponent) => {
  const AddMemberHocComponent = (props) => {
    const { t } = useTranslation();
    const { currentOrganization, openModal, open, onClose } = props;
    const [isLimited, setIsLimited] = useState(true);
    const openLimitModal = () => openLimitedOrgMembersModal({ currentOrganization, openModal, t });
    const openFailedModal = () => openFailedWhenInvite({ openModal, t });
    const openBlockedByUpgradingModal = (metadata) => openBlockedByUpgradingSetting({ openModal, t, metadata });

    useEffect(() => {
      const isLimited = open && organizationServices.getReachLimitedOrgMembers(currentOrganization);
      if (isLimited) {
        openLimitModal();
        onClose();
      }
      setIsLimited(isLimited);
    }, [open]);

    if (isLimited) return null;

    return (
      <WrappedComponent
        {...props}
        openLimitModal={openLimitModal}
        openFailedModal={openFailedModal}
        openBlockedByUpgradingModal={openBlockedByUpgradingModal}
      />
    );
  };

  AddMemberHocComponent.propTypes = {
    currentOrganization: PropTypes.object,
    navigate: PropTypes.func,
    openModal: PropTypes.func,
    open: PropTypes.bool,
    onClose: PropTypes.func,
  };

  AddMemberHocComponent.defaultProps = {
    navigate: () => {},
    openModal: () => {},
    onClose: () => {},
    open: false,
    currentOrganization: {},
  };

  return AddMemberHocComponent;
};

export default withAddMemberHOC;
