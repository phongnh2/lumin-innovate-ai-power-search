import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useGetCurrentOrganization, useTranslation } from 'hooks';

import { organizationServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';

import { toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ModalTypes } from 'constants/lumin-common';
import { InviteUsersSetting } from 'constants/organization.enum';
import { DOMAIN_VISIBILITY_SETTING } from 'constants/organizationConstants';

const useChangeInvitePermission = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentOrganization = useGetCurrentOrganization();
  const { settings, _id: orgId } = currentOrganization;
  const { domainVisibility } = settings || {};

  const submitChangeInvitePermission = async (permission: InviteUsersSetting) => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    try {
      const orgSettings = await organizationServices.updateInviteUsersSetting({
        orgId,
        inviteUsersSetting: permission,
      });
      const newSettings = {
        ...currentOrganization.settings,
        inviteUsersSetting: orgSettings.inviteUsersSetting,
      };
      dispatch(actions.updateCurrentOrganization({ settings: newSettings }));
      dispatch(actions.updateOrganizationInList(orgId, { settings: newSettings }));
      toastUtils.success({ message: t('orgDashboardSecurity.invitePermissionHaveBeenUpdated') });
    } catch (error) {
      toastUtils.openUnknownErrorToast();
    } finally {
      dispatch(actions.closeModal());
    }
  };

  const showReviseModal = (permission: InviteUsersSetting) => {
    dispatch(
      actions.openModal({
        type: ModalTypes.WARNING,
        title: t('orgDashboardSecurity.reviseModal.title'),
        message: t('orgDashboardSecurity.reviseModal.message'),
        confirmButtonTitle: t('orgDashboardSecurity.reviseModal.processAnyway'),
        onConfirm: () => submitChangeInvitePermission(permission),
        onCancel: () => {},
        useReskinModal: true,
      })
    );
  };

  const changeInvitePermission = async (e: React.ChangeEvent<HTMLInputElement> | string) => {
    let permission;
    if (typeof e === 'string') {
      permission = e;
    } else {
      permission = e.target.value;
    }
    switch (permission) {
      case InviteUsersSetting.ADMIN_BILLING_CAN_INVITE: {
        orgTracking.trackChangeSetting({
          elementName: ButtonName.SECURITY_CIRCLE_ADMIN_CAN_INVITE,
        });
        await submitChangeInvitePermission(permission);
        break;
      }
      case InviteUsersSetting.ANYONE_CAN_INVITE: {
        orgTracking.trackChangeSetting({
          elementName: ButtonName.SECURITY_CIRCLE_MEMBERS_CAN_INVITE,
        });
        if (domainVisibility === DOMAIN_VISIBILITY_SETTING.VISIBLE_NEED_APPROVE) {
          showReviseModal(permission);
          break;
        }
        await submitChangeInvitePermission(permission);
        break;
      }
      default:
        break;
    }
  };

  return { changeInvitePermission };
};

export default useChangeInvitePermission;
