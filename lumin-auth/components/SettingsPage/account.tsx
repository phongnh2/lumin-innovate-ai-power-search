import { css } from '@emotion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';

import { SOCKET_ON } from '@/constants/socket';
import { useForgetLastAccessAccountMutation } from '@/features/account/account-api-slice';
import { useDeleteAccountMutation, useReactivateAccountMutation } from '@/features/account/settings-api-slice';
import { setCurrentUser } from '@/features/account/user-slice';
import { updateModalProperties } from '@/features/modal-slice';
import useTranslation from '@/hooks/useTranslation';
import { IUser } from '@/interfaces/user';
import { useAppSelector } from '@/lib/hooks';
import socket from '@/lib/socket';
import { getCurrentUser } from '@/selectors';
import { Button, ConfirmationDialog, Icomoon, Text, Colors, useSnackbar } from '@/ui';
import { ButtonColor } from '@/ui/Button';
import { emitToNativeWebView } from '@/utils/account.utils';
import { avoidNonOrphansWord } from '@/utils/string.utils';

import useGetDeleteAccountConfirmMessage from './ConfirmDeleteAccountModal/useGetDeleteAccountConfirmMessage';
import { useFetchOwnTeamAndOrg } from './hooks';

import { deleteAccountDescCss, messageCss, reactivateMessageContainerCss, titleCss } from './Settings.styled';

const ConfirmDeleteAccountModal = dynamic(() => import('./ConfirmDeleteAccountModal'), { ssr: false });

export function Account() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUser = useAppSelector(getCurrentUser, shallowEqual) as IUser;
  const [openDialog, setOpenDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { ownerResources, fetchTeamAndOrganizationOwner, loading: fetchingData } = useFetchOwnTeamAndOrg({ setOpenDialog, setShowDeleteModal });
  const [deleteAccount] = useDeleteAccountMutation();
  const [forgetLastAccessAccount] = useForgetLastAccessAccountMutation();

  const [reactivateAccount] = useReactivateAccountMutation();
  const { enqueueSnackbar } = useSnackbar();

  const { ConfirmInput, matchConfirmString } = useGetDeleteAccountConfirmMessage();
  const router = useRouter();

  const onDeleteAccount = async () => {
    try {
      await fetchTeamAndOrganizationOwner();
    } catch (error: any) {
      enqueueSnackbar(error.data?.message, { variant: 'error' });
    }
  };

  const onReactiveAccount = async () => {
    try {
      setIsProcessing(true);
      await reactivateAccount();
      dispatch(setCurrentUser({ ...currentUser, deletedAt: '' }));
      emitToNativeWebView('reactivateAccountSuccess');
      enqueueSnackbar(t('account.accountHasBeenReactivated'), { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.graphQLErrors[0].message, { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const onConfirmDeleteAccount = async () => {
    try {
      dispatch(updateModalProperties({ isProcessing: true }));
      socket.removeListener(SOCKET_ON.User.CompletedDeleteUser);
      await deleteAccount().unwrap();
      await forgetLastAccessAccount();
      emitToNativeWebView('deleteAccountSuccess');
      enqueueSnackbar(t('account.deleteUserSuccessfully'), { variant: 'success' });
      router.push('/sign-in');
    } finally {
      dispatch(updateModalProperties({ isProcessing: false }));
      setShowDeleteModal(false);
      setOpenDialog(false);
    }
  };

  return (
    <>
      <section>
        <Text
          as='h2'
          bold
          css={[
            titleCss,
            css`
              margin-bottom: 16px;
            `
          ]}
        >
          {t('account.title')}
        </Text>
        <Button
          loading={isProcessing || fetchingData}
          color={currentUser.deletedAt ? ButtonColor.PRIMARY : ButtonColor.TERTIARY}
          onClick={currentUser.deletedAt ? onReactiveAccount : onDeleteAccount}
          width={166}
          tabIndex={2}
        >
          {currentUser.deletedAt ? t('account.reactivate') : t('account.deleteMyAccount')}
        </Button>
        {currentUser.deletedAt && (
          <div css={reactivateMessageContainerCss}>
            <Icomoon type='info' size={18} color={Colors.SUCCESS_50} />
          </div>
        )}
        <Text variant='neutral' css={deleteAccountDescCss}>
          {avoidNonOrphansWord(t('account.noteDeleteAccount'))}{' '}
          <Link
            href='https://luminpdf.com/guide/lumin-google-drive/delete-account'
            title='Delete account guide'
            target='_blank'
            css={css`
              text-decoration: underline;
            `}
            tabIndex={2}
          >
            <b>{avoidNonOrphansWord(t('account.readHereForMoreInformation'))}</b>
          </Link>
        </Text>
      </section>

      <ConfirmationDialog
        open={showDeleteModal}
        title={t('account.deleteAccount')}
        confirmText={t('account.delete')}
        onConfirm={onConfirmDeleteAccount}
        disableConfirm={!matchConfirmString}
        onCancel={() => setShowDeleteModal(false)}
        message={
          <>
            <Text
              css={[
                messageCss,
                css`
                  margin-bottom: 16px;
                `
              ]}
              as='p'
            >
              {t('account.messageDeactivateYourAccount1')}
            </Text>
            <Text css={messageCss} as='p'>
              {t('account.thisActionCannotBeUndone')}
            </Text>
            <ConfirmInput
              css={css`
                margin-top: 16px;
              `}
            />
          </>
        }
      />
      <ConfirmDeleteAccountModal
        open={openDialog}
        onConfirm={onConfirmDeleteAccount}
        onClose={() => setOpenDialog(false)}
        ownershipResources={ownerResources}
      />
    </>
  );
}
