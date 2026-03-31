import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useViewerMatch } from 'hooks/useViewerMatch';

import { userServices } from 'services';

import { dateUtil, toastUtils } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { PaymentStatus } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

import { useTranslation } from './useTranslation';

const useReactivateAccount = ({
  organization,
  handleAfterReactivate = () => {},
  handleAfterCancelReactivate = () => {},
}: {
  organization: IOrganization;
  handleAfterReactivate?: () => void;
  handleAfterCancelReactivate?: () => void;
}): {
  openReactivateModal: () => void;
} => {
  const { t } = useTranslation();
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { data: organizations } = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  const { payment, _id: orgId } = organization || {};
  const dispatch = useDispatch();
  const { isViewer } = useViewerMatch();

  const handleReactivateUser = async (): Promise<void> => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    try {
      await userServices.reactiveAccount();
      toastUtils.success({ message: t('settingGeneral.accountHasBeenReactivated') });
    } finally {
      const data = {
        payment: {
          ...payment,
          status: PaymentStatus.ACTIVE,
        },
      };
      if (organizations.length) {
        batch(() => {
          if (!isViewer) {
            dispatch(actions.updateCurrentOrganization(data));
          }
          dispatch(actions.updateOrganizationInList(orgId, data));
        });
      }
    }
  };

  const handleOnConfirm = async (): Promise<void> => {
    await handleReactivateUser();
    handleAfterReactivate();
  };

  const modalSetting = {
    type: ModalTypes.WARNING,
    title: t('settingBilling.titleReactivateDefualtOrg'),
    message: t('settingBilling.messageReactivateDefaultOrg', {
      deletedAt: dateUtil.formatDeleteAccountTime(currentUser.deletedAt),
    }),
    confirmButtonTitle: t('common.reactivate'),
    onConfirm: handleOnConfirm,
    onCancel: handleAfterCancelReactivate,
    useReskinModal: true,
  };
  const openReactivateModal = (): void => {
    dispatch(actions.openModal(modalSetting));
  };

  return {
    openReactivateModal,
  };
};

export default useReactivateAccount;
