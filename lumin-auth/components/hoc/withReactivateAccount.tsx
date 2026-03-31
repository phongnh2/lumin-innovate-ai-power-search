import { Trans } from 'next-i18next';
import React, { useCallback, useMemo, useState } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';

import { useReactivateAccountMutation } from '@/features/account/settings-api-slice';
import { setCurrentUser } from '@/features/account/user-slice';
import useTranslation from '@/hooks/useTranslation';
import { useAppSelector } from '@/lib/hooks';
import { getCurrentUser } from '@/selectors';
import { ConfirmationDialog, DialogType, useSnackbar } from '@/ui';
import { formatDeleteAccountTime } from '@/utils/account.utils';

function withReactivateAccount<T>(WrappedComponent: React.ComponentType<T & { openReactivateModal: () => void }>): (props: T) => JSX.Element {
  function HOC(props: T) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currentUser = useAppSelector(getCurrentUser, shallowEqual);
    const [showReactivateModal, setShowReactivateModal] = useState(false);
    const [reactivateAccount] = useReactivateAccountMutation();
    const { enqueueSnackbar } = useSnackbar();
    const onConfirmReactivate = async (): Promise<void> => {
      try {
        await reactivateAccount();
        dispatch(setCurrentUser({ ...currentUser, deletedAt: '' }));
        enqueueSnackbar(t('account.accountHasBeenReactivated'), { variant: 'success' });
      } catch (error: any) {
        enqueueSnackbar(error.data.message, { variant: 'error' });
      } finally {
        setShowReactivateModal(false);
      }
    };

    const openReactivateModal = useCallback(() => {
      setShowReactivateModal(true);
    }, []);

    const wrapper = useMemo(() => <WrappedComponent {...props} openReactivateModal={openReactivateModal} />, [openReactivateModal, props]);

    return (
      <>
        {showReactivateModal && (
          <ConfirmationDialog
            open
            title={t('reactivateAccount.title')}
            confirmText={t('account.reactivate')}
            onConfirm={onConfirmReactivate}
            onCancel={() => setShowReactivateModal(false)}
            // eslint-disable-next-line max-len
            message={
              <>
                <Trans i18nKey='account.yourAccountWillBeDeletedOn' values={{ time: formatDeleteAccountTime(currentUser?.deletedAt as unknown as Date) }} />
                {t('reactivateAccount.title')}
              </>
            }
            type={DialogType.Mood}
          />
        )}
        {wrapper}
      </>
    );
  }
  return HOC;
}

export default withReactivateAccount;
