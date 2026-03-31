import { pick } from 'lodash';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';

import BentoMenu from '@/components/BentoMenu';
import ProfileDropdown from '@/components/ProfileDropdown';
import { environment } from '@/configs/environment';
import { CookieStorageKey } from '@/constants/cookieKey';
import useTranslation from '@/hooks/useTranslation';
import { useAppSelector } from '@/lib/hooks';
import LuminLogo from '@/public/assets/logo-lumin.svg?url';
import { getCurrentUser, getIdentity } from '@/selectors';
import { Avatar, AvatarSize, Dropdown, ConfirmationDialog } from '@/ui';
import CookieUtils from '@/utils/cookie.utils';
import { getFullPathWithLanguageFromUrl } from '@/utils/getLanguage';

import useClickLogout from '../ProfileDropdown/useClickLogout';

import {
  authenticatedHeaderCss,
  authenticatedLogoCss,
  guestHeaderCss,
  headerCss,
  headerRightCss,
  headingCss,
  leftHeaderCss,
  logoImageCss,
  logoCss
} from './Header.styled';

interface HeaderProps {
  logoClassName?: string;
  right?: React.ReactElement;
  className?: string;
}

export function Header(props: HeaderProps) {
  const { className, right, logoClassName } = props;
  const [href, setHref] = useState('');

  useEffect(() => {
    setHref(environment.public.host.staticUrl + getFullPathWithLanguageFromUrl());
  }, []);

  return (
    <header css={[headerCss, guestHeaderCss]} className={className}>
      <div className={logoClassName}>
        <Link href={href} tabIndex={-1}>
          <Image src={LuminLogo} css={logoImageCss} alt={'Lumin Logo'} />
        </Link>
      </div>
      <div>{right}</div>
    </header>
  );
}

export type AuthenticatedHeaderProps = {
  heading: string;
  topBannerHeight?: number;
};
export function AuthenticatedHeader({ heading, topBannerHeight }: AuthenticatedHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { ref } = router.query;
  const isMobileRef = useRef(ref === 'mobile');
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [logout] = useClickLogout();
  const identity = useAppSelector(getIdentity, shallowEqual);
  const currentUser = useAppSelector(getCurrentUser, shallowEqual);
  if (!identity || !currentUser) {
    return null;
  }
  const avatarRemoteId = identity?.traits.avatarRemoteId || currentUser.avatarRemoteId;
  const avatarPath = avatarRemoteId && `${environment.public.host.backendUrl}/user/getAvatar?remoteId=${avatarRemoteId}`;
  const isProductionOrDevelopment = environment.public.common.environment === 'production' || environment.public.common.environment === 'development';
  return (
    <>
      <header
        css={[headerCss, authenticatedHeaderCss]}
        style={{
          top: `${topBannerHeight}px`
        }}
      >
        <div css={leftHeaderCss}>
          <div css={authenticatedLogoCss}>
            <Image src={LuminLogo} css={logoCss} alt={'Lumin Logo'} />
          </div>
          <p css={headingCss}>{heading}</p>
        </div>
        <div css={headerRightCss}>
          {!isMobileRef.current && <BentoMenu />}
          <Dropdown
            trigger={
              <Avatar
                data-cy='profile_dropdown_avatar'
                size={{ mobile: AvatarSize.XXS, tablet: AvatarSize.SM }}
                name={identity.traits.name}
                remotePath={avatarPath}
              />
            }
          >
            {({ closePopper }) => (
              <ProfileDropdown
                closePopper={closePopper}
                onShowLogoutModal={() => setShowConfirmLogout(true)}
                avatarRemoteId={avatarRemoteId}
                {...pick(identity.traits, ['name', 'email'])}
              />
            )}
          </Dropdown>
        </div>
      </header>
      <ConfirmationDialog
        open={showConfirmLogout}
        title={t('signOutModal.title')}
        confirmText={t('common.yes')}
        onConfirm={() => {
          CookieUtils.delete(
            isProductionOrDevelopment
              ? CookieStorageKey.GOOGLE_ACCESS_TOKEN
              : `${CookieStorageKey.GOOGLE_ACCESS_TOKEN}_${environment.public.common.environment}`
          );
          logout();
        }}
        cancelText={t('common.cancel')}
        onCancel={() => setShowConfirmLogout(false)}
        message={t('signOutModal.message')}
      />
    </>
  );
}
