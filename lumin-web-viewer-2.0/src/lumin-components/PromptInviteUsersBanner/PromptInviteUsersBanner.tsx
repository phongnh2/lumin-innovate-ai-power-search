import classNames from 'classnames';
import { Icomoon as KiwiIcomoon, Text, Button, IconButton, AvatarGroup, Avatar } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import UserPlusAvatar from 'assets/reskin/lumin-svgs/user-plus-avatar.svg';

import Icomoon from 'luminComponents/Icomoon';
import { CenterContainer, RightContainer } from 'luminComponents/Shared/shared.styled';

import { useDesktopMatch, useEnableWebReskin, useTranslation, useNetworkStatus } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { Colors } from 'constants/styles';

import { SkeletonBanner } from './components/SkeletonBanner';
import { CloseBannerReason, InviteUserAvatar } from './PromptInviteUsersBanner.types';

import * as Styled from './PromptInviteUsersBanner.styled';

import styles from './PromptInviteUsersBanner.module.scss';

type PromptInviteUsersBannerProps = {
  loading: boolean;
  content: {
    multiLanguageKey: string;
    attributes?: Record<string, string | number>;
  };
  onClose(closeReason: CloseBannerReason): void;
  onPreview(): void;
  actionButtonText: string;
  inviteUserAvatars: InviteUserAvatar[];
};

const PromptInviteUsersBanner = ({
  loading,
  content,
  onPreview,
  onClose,
  actionButtonText,
  inviteUserAvatars,
}: PromptInviteUsersBannerProps): JSX.Element => {
  const { t: translate } = useTranslation();

  const { isEnableReskin } = useEnableWebReskin();

  const isDesktopMatch = useDesktopMatch();
  const { isOffline } = useNetworkStatus();
  const { onKeyDown } = useKeyboardAccessibility();

  if (!content) {
    return null;
  }
  if (isEnableReskin) {
    return (
      <div className={styles.bannerContainer} id="prompt-invite-users-banner">
        {loading ? (
          <SkeletonBanner isReskin />
        ) : (
          <div className={classNames(styles.bannerWrapper, { [styles.disabled]: isOffline })}>
            <div className={styles.leftSection}>
              <div
                role="button"
                tabIndex={0}
                className={styles.avatarGroup}
                onClick={onPreview}
                onKeyDown={onKeyDown}
                data-cy="avatar-group"
              >
                {inviteUserAvatars.length > 0 ? (
                  <AvatarGroup
                    size="xs"
                    variant="outline"
                    max={inviteUserAvatars.length > 5 ? 5 : inviteUserAvatars.length}
                    total={inviteUserAvatars.length}
                    propsItems={inviteUserAvatars}
                    renderItem={(props) => <Avatar {...props} />}
                  />
                ) : (
                  <Avatar size="xs" src={UserPlusAvatar} />
                )}
              </div>
              <Text type="title" size="sm" className={styles.content}>
                <Trans
                  i18nKey={content.multiLanguageKey}
                  values={content.attributes}
                  components={{ b: <b className={styles.orgName} /> }}
                />
              </Text>
              <Button
                colorType="system"
                variant="outlined"
                size="md"
                disabled={loading}
                onClick={onPreview}
                className={styles.inviteMembersBtn}
                data-cy="invite_members_button"
                style={{
                  color: 'var(--kiwi-colors-custom-brand-tools-on-unlock-container)',
                  borderColor: 'var(--kiwi-colors-custom-brand-tools-on-unlock-container)',
                }}
              >
                {translate(actionButtonText)}
              </Button>
            </div>
            <div className={styles.rightSection}>
              <IconButton
                size="md"
                icon={<KiwiIcomoon type="x-md" />}
                onClick={() => onClose(CloseBannerReason.CLICK_CLOSE_BTN)}
                data-cy="close_banner_button"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Styled.BannerContainer id="prompt-invite-users-banner">
      {loading ? (
        <SkeletonBanner />
      ) : (
        <Styled.BannerWrapper>
          <CenterContainer>
            <Styled.BannerContent>
              <Trans i18nKey={content.multiLanguageKey} components={{ b: <b /> }} values={content.attributes} />
            </Styled.BannerContent>
            <Styled.PreviewBtn disabled={loading} onClick={onPreview}>
              {translate(actionButtonText)}
            </Styled.PreviewBtn>
          </CenterContainer>
          <RightContainer>
            <Icomoon
              onClick={() => onClose(CloseBannerReason.CLICK_CLOSE_BTN)}
              className="cancel"
              size={14}
              color={Colors.NEUTRAL_80}
              style={{
                cursor: 'pointer',
                padding: '6px',
                margin: `0 ${isDesktopMatch ? 10 : 4}px`,
              }}
            />
          </RightContainer>
        </Styled.BannerWrapper>
      )}
    </Styled.BannerContainer>
  );
};

export default React.memo(PromptInviteUsersBanner);
