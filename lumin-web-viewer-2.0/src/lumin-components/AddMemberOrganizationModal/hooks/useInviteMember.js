import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { OrganizationUtilities } from 'utils/Factory/Organization';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_MAX_MEMBERS } from 'constants/organizationConstants';
import { STATIC_PAGE_URL } from 'constants/urls';

export function useInviteMember({
  totalMembers,
  openMaxMemberModal,
  hasReachedLimit,
  toggleRequestToPay,
  redirectUrl,
  currentOrganization,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });
  const { payment } = currentOrganization;
  const { t } = useTranslation();

  const openEnterpriseLimitModal = ({ onCloseAddMemberModal = () => {} }) => {
    const modalConfig = {
      type: ModalTypes.WARNING,
      title: t('memberPage.addMemberModal.unableToInviteMembers'),
      message: t('memberPage.addMemberModal.messageEnterpriseReachLimit', {
        quantity: payment.quantity,
      }),
      confirmButtonTitle: t('common.contactSales'),
      onCancel: onCloseAddMemberModal,
      onConfirm: () => {
        window.open(STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale')));
        onCloseAddMemberModal();
      },
      useReskinModal: true,
    };
    return dispatch(actions.openModal(modalConfig));
  };

  const openBusinessLimitModal = ({ onCloseAddMemberModal = () => {} }) =>
    orgUtilities.payment.isMonthlyPeriod()
      ? toggleRequestToPay(true)
      : dispatch(
          actions.openModal({
            type: ModalTypes.WARNING,
            title: t('memberPage.addMemberModal.orgHasReachedLimit'),
            message: t('memberPage.addMemberModal.messageOrgHasReachedLimit', { quantity: payment.quantity }),
            confirmButtonTitle: t('common.upgrade'),
            onCancel: onCloseAddMemberModal,
            onConfirm: () => {
              navigate(redirectUrl);
              onCloseAddMemberModal();
            },
          })
        );

  const inviteMemberGuard = ({ onCloseAddMemberModal = () => {} }) => {
    if (
      !orgUtilities.payment.isEnterprise() &&
      !orgUtilities.hasUnlimitedMember() &&
      totalMembers > ORGANIZATION_MAX_MEMBERS
    ) {
      openMaxMemberModal();
      return {
        shouldInvite: false,
      };
    }
    if (orgUtilities.payment.isEnterprise() && hasReachedLimit) {
      openEnterpriseLimitModal({ onCloseAddMemberModal });
      return {
        shouldInvite: false,
      };
    }
    if (hasReachedLimit && orgUtilities.payment.isBusiness()) {
      openBusinessLimitModal({ onCloseAddMemberModal });
      return {
        shouldInvite: false,
      };
    }

    return {
      shouldInvite: true,
    };
  };
  return { inviteMemberGuard };
}
