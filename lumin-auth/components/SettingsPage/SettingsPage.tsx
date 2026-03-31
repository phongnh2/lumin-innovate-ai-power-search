import { css } from '@emotion/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Trans } from 'next-i18next';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';

import withReactivateAccount from '@/components/hoc/withReactivateAccount';
import { Account } from '@/components/SettingsPage/account';
import { ProfileName } from '@/components/SettingsPage/profile-name';
import ProfilePassword from '@/components/SettingsPage/ProfilePassword';
import { environment } from '@/configs/environment';
import { CookieStorageKey } from '@/constants/cookieKey';
import { LocalStorageKey } from '@/constants/localStorageKey';
import { SOCKET_ON } from '@/constants/socket';
import { useGetCurrentUserQuery } from '@/features/account/account-api-slice';
import { useEnsureSettingsFlowMutation } from '@/features/account/settings-api-slice';
import { updateCurrentUser } from '@/features/account/user-slice';
import { updateModalProperties } from '@/features/modal-slice';
import useForceLogout from '@/hooks/auth/useForceLogout';
import useSocketListener from '@/hooks/useSocketListener';
import useTranslation from '@/hooks/useTranslation';
import { Identity } from '@/interfaces/ory';
import { ForceLogoutType, LoginService } from '@/interfaces/user';
import { useAppSelector } from '@/lib/hooks';
import { getCurrentUser, getIdentity } from '@/selectors';
import { Text, VerticalGap, ConfirmationDialog, VerticalBar } from '@/ui';
import { emitToNativeWebView, OidcLogo } from '@/utils/account.utils';
import { checkOrySessionExpiry, removeAuthenticationCredentials } from '@/utils/auth.utils';
import CookieUtils from '@/utils/cookie.utils';
import { getFullPathWithLanguageFromUrl } from '@/utils/getLanguage';

import withAuthorized from '../hoc/withAuthorized';

import SsoSignInBanner from './components/SsoSignInBanner';
import { useChangePassword, useUploadPhoto, useUpdateTraits } from './hooks';
import useRemovePhoto from './hooks/useRemovePhoto';
import ProfileAvatar from './ProfileAvatar';
import SocialSignInSection from './SocialSignIn/SocialSignInSection';

import { emailContainerCss, profileAvatarCss, sectionCss, ssoSignInBannerWrapperCss, titleCss, verticalBarCss } from './Settings.styled';

function SettingsPage({ openReactivateModal }: Readonly<{ openReactivateModal: () => void }>) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
  const [showDeletedAccountModal, setShowDeletedAccountModal] = useState(false);
  const [isUserDeletedFromProvisioning, setIsUserDeletedFromProvisioning] = useState(false);
  const [emailChangedModalSetting, setEmailChangedModalSetting] = useState<{ open: boolean; newEmail: string | null }>({ open: false, newEmail: null });
  const [changingName, setChangingName] = useState(false);
  const router = useRouter();
  const { ref, flow: flowQuery } = router.query;
  const isMobileRef = useRef(ref === 'mobile');
  const [changingPassword, setChangingPassword] = useState(Boolean(flowQuery) && !isMobileRef.current);
  const currentUser = useAppSelector(getCurrentUser, shallowEqual);
  const identity = useAppSelector(getIdentity, shallowEqual);
  const [ensureFlow, { data: flow }] = useEnsureSettingsFlowMutation();
  const { uploadPhoto, isLoading: uploadingPhoto, clientError } = useUploadPhoto();
  const { removeAvatar, isLoading: removing } = useRemovePhoto();
  const { changePassword, error: changePasswordError, reset: resetChangePasswordMutation } = useChangePassword();
  const { updateTraits, isLoading: isUpdatingTraits, serverError: updateTraitsError } = useUpdateTraits();
  const [forceLogout] = useForceLogout();
  const [socialSignInError, setSocialSignInError] = useState<unknown>(null);

  const updateReactivatedAccount = () => {
    dispatch(updateCurrentUser({ deletedAt: '' }));
  };

  // Use a ref to track if we've already blocked the logout modal once
  // This prevents multiple socket events from showing the modal
  const hasBlockedLogoutModalRef = useRef(false);

  const openLogoutModal = useCallback(() => {
    // Check localStorage for the flag
    const loginMethodChangePending = localStorage.getItem(LocalStorageKey.LOGIN_METHOD_CHANGE_PENDING);

    // If flag is set in localStorage, or we've already blocked once then skip showing the modal
    if (loginMethodChangePending || hasBlockedLogoutModalRef.current) {
      hasBlockedLogoutModalRef.current = true;
      return;
    }

    setShowLogoutModal(true);
  }, []);
  const openDeletedAccountModal = useCallback(() => setShowDeletedAccountModal(true), []);
  const openEmailChangedModal = ({ newEmail }: { newEmail: string }) => setEmailChangedModalSetting({ open: true, newEmail });

  const handleUserDeletion = useCallback((messageData: { fromProvisioning?: boolean; [key: string]: unknown }) => {
    const isFromProvisioning = messageData.fromProvisioning === true;

    setIsUserDeletedFromProvisioning(isFromProvisioning);
    setShowDeletedAccountModal(true);
  }, []);

  const isOrySessionExpired = useMemo(
    () => [updateTraitsError, changePasswordError, socialSignInError].some(error => checkOrySessionExpiry(error)),
    [updateTraitsError, changePasswordError, socialSignInError]
  );

  const [staticUrl, setStaticUrl] = useState(environment.public.host.staticUrl);

  useGetCurrentUserQuery();

  useSocketListener(SOCKET_ON.User.LogOut, openLogoutModal);
  useSocketListener(SOCKET_ON.User.AdminDeleteUser, openDeletedAccountModal);

  // handle CompletedDeleteUser with conditional logic based on fromProvisioning
  useSocketListener(SOCKET_ON.User.CompletedDeleteUser, handleUserDeletion);

  useSocketListener(SOCKET_ON.User.reactiveUserAccount, updateReactivatedAccount);
  useSocketListener(SOCKET_ON.User.UserEmailChanged, openEmailChangedModal);

  const reactivatedModalDecorator = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T,>(fallBack: (...params: T[]) => any | Promise<any>) => {
      if (currentUser?.deletedAt) {
        return () => {
          openReactivateModal();
        };
      } else {
        return fallBack;
      }
    },
    [currentUser?.deletedAt, openReactivateModal]
  );

  const { traits } = identity as Identity;

  // change profile name
  const onSaveName = async (name: string) => {
    const newFlow = await ensureFlow({ initial: flow }).unwrap();
    await updateTraits({ flow: newFlow, traits: { ...traits, name } });
  };

  // change password
  const onChangePassword = async (password: string) => {
    const newFlow = await ensureFlow({ initial: flow }).unwrap();
    const payload = await changePassword({ flow: newFlow, newPassword: password }).unwrap();
    setShowForceLogoutModal(true);
    return payload;
  };

  const onConfirmLogoutModal = () => {
    if (isOrySessionExpired) {
      forceLogout();
      emitToNativeWebView('forceLogout');
      return;
    }

    const isProductionOrDevelopment = environment.public.common.environment === 'production' || environment.public.common.environment === 'development';

    setShowLogoutModal(false);
    CookieUtils.delete(
      isProductionOrDevelopment ? CookieStorageKey.GOOGLE_ACCESS_TOKEN : `${CookieStorageKey.GOOGLE_ACCESS_TOKEN}_${environment.public.common.environment}`
    );
    localStorage.removeItem('token');
    router.push('/sign-in');
  };

  // profile values
  const email = traits?.email ?? '';
  const name = traits?.name ?? '';
  const isPasswordAccount = traits.loginService === LoginService.EMAIL_PASSWORD;
  const avatarRemoteId = identity?.traits.avatarRemoteId || currentUser?.avatarRemoteId;
  const avatarRemotePath = avatarRemoteId && `${environment.public.host.backendUrl}/user/getAvatar?remoteId=${avatarRemoteId}`;
  const LogoComponent = traits?.loginService && OidcLogo[traits.loginService];
  const isSamlSsoAccount = useMemo(() => traits?.loginService === LoginService.SAML_SSO, [traits?.loginService]);

  useEffect(() => {
    if (changingName) {
      setChangingPassword(false);
    }
  }, [changingName]);

  useEffect(() => {
    if (changingPassword) {
      setChangingName(false);
    }
  }, [changingPassword]);

  useEffect(() => {
    if (isOrySessionExpired) {
      openLogoutModal();
    }
  }, [isOrySessionExpired, openLogoutModal]);

  useEffect(() => {
    setStaticUrl(environment.public.host.staticUrl + getFullPathWithLanguageFromUrl(t('url.saleSupport.contactSupport')));
  }, [t]);

  return (
    <section css={sectionCss}>
      {isSamlSsoAccount && (
        <div css={ssoSignInBannerWrapperCss}>
          <SsoSignInBanner />
        </div>
      )}
      <Text
        as='h2'
        bold
        css={[
          titleCss,
          css`
            margin-bottom: 24px;
          `
        ]}
      >
        {t('profileSettings.profileInfo')}
      </Text>
      <ProfileAvatar
        css={profileAvatarCss}
        name={name}
        src={avatarRemotePath}
        onUpload={reactivatedModalDecorator(uploadPhoto)}
        onRemove={reactivatedModalDecorator(removeAvatar)}
        loading={uploadingPhoto || removing}
        error={clientError}
        disabledUpload={isSamlSsoAccount}
        loginService={traits?.loginService}
      />
      <div
        css={css`
          max-width: 456px;
        `}
      >
        <article css={emailContainerCss}>
          {!isPasswordAccount && LogoComponent && (
            <LogoComponent
              css={css`
                margin-right: 16px;
              `}
            />
          )}
          <VerticalGap level={2}>
            <Text level={6} bold as='h3'>
              {t('common.email')}
            </Text>
            <Text>{email}</Text>
          </VerticalGap>
        </article>

        <ProfileName
          name={name}
          onSave={reactivatedModalDecorator(onSaveName)}
          changingName={changingName}
          setChangingName={setChangingName}
          loading={isUpdatingTraits}
          loginService={traits?.loginService}
        />
      </div>
      {isPasswordAccount && (
        <>
          <VerticalBar css={verticalBarCss} />
          <ProfilePassword
            changePassword={reactivatedModalDecorator(onChangePassword)}
            error={changePasswordError}
            reset={resetChangePasswordMutation}
            changingPassword={changingPassword}
            setChangingPassword={setChangingPassword}
          />
        </>
      )}
      {!isMobileRef.current && identity && !isSamlSsoAccount ? (
        <SocialSignInSection
          identity={identity}
          onError={error => {
            setSocialSignInError(error);
          }}
        />
      ) : (
        <VerticalBar css={verticalBarCss} />
      )}
      <Account />
      <ConfirmationDialog
        open={showLogoutModal}
        title={t('modalSessionExpired.title')}
        confirmText={t('common.ok')}
        onConfirm={onConfirmLogoutModal}
        message={t('modalSessionExpired.message')}
      />
      <ConfirmationDialog
        open={showForceLogoutModal}
        title={t('resetPassword.passwordChanged')}
        cancelText={t('resetPassword.stayLoggedIn')}
        confirmText={t('resetPassword.logOut')}
        onCancel={() => {
          emitToNativeWebView('stayLoggedIn');
          setShowForceLogoutModal(false);
        }}
        onConfirm={() => {
          dispatch(updateModalProperties({ isProcessing: true }));
          forceLogout(ForceLogoutType.CHANGED_PASSWORD);
          emitToNativeWebView('forceLogout');
        }}
        messageAlign='left'
        message={t('resetPassword.message')}
      />
      <ConfirmationDialog
        open={showDeletedAccountModal}
        title={t('expiredPermissionModal.title')}
        confirmText={t('common.ok')}
        onConfirm={() => {
          setShowDeletedAccountModal(false);
          removeAuthenticationCredentials();
        }}
        message={
          <Text as='p' align='center'>
            {isUserDeletedFromProvisioning ? (
              t('expiredPermissionModal.messageProvisioning')
            ) : (
              <Trans
                i18nKey='expiredPermissionModal.message'
                components={{
                  a: <Text as={Link} bold variant='highlight' href={staticUrl} target='_blank' rel='noopener noreferrer' underline />
                }}
              />
            )}
          </Text>
        }
      />
      <ConfirmationDialog
        open={emailChangedModalSetting.open}
        title={t('changeEmailModal.title')}
        confirmText={t('common.ok')}
        onConfirm={() => {
          dispatch(updateModalProperties({ isProcessing: true }));
          forceLogout();
        }}
        message={
          emailChangedModalSetting.newEmail === email ? (
            t('changeEmailModal.sessionExpiredMessage')
          ) : (
            <Text as='p' align='center'>
              <Trans
                i18nKey='changeEmailModal.accountChangeMessage'
                components={{
                  b: <Text as='span' bold />
                }}
                values={{ email: emailChangedModalSetting.newEmail }}
              />
            </Text>
          )
        }
      />
    </section>
  );
}

export default withAuthorized(withReactivateAccount<{ identity: Identity }>(SettingsPage));
