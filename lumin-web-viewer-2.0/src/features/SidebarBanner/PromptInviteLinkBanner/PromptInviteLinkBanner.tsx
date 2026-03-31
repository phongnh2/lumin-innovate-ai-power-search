import { Avatar, AvatarGroup, Button, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddMemberOrganizationModal from 'luminComponents/AddMemberOrganizationModal';

import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';
import useTrackingCardEvent from 'hooks/useTrackingCardEvent';

import { CardName, CardPurpose } from 'utils/Factory/EventCollection/constants/CardEvent';

import { inviteLinkSidebarLocalStorage } from 'features/InviteLink/utils/localStorage';

import Avatar3 from './images/avatar-1.png';
import Avatar4 from './images/avatar-5.png';
import Avatar2 from './images/avatar-6.png';
import Avatar1 from './images/avatar-8.png';
import Avatar5 from './images/label.png';

import styles from './PromptInviteLinkBanner.module.scss';

const avatars = [
  { src: Avatar1, name: 'Avatar 1' },
  { src: Avatar2, name: 'Avatar 2' },
  { src: Avatar3, name: 'Avatar 3' },
  { src: Avatar4, name: 'Avatar 4' },
  { src: Avatar5, name: 'Avatar 5' },
];

const PromptInviteLinkBanner = ({
  setIsShowBanner,
  orgId,
}: {
  setIsShowBanner: (isShowBanner: boolean) => void;
  orgId: string;
}) => {
  const { t } = useTranslation();

  const [isOpenAddMemberModal, setOpenAddMemberModal] = useState(false);

  const { trackCardViewed, trackCardConfirmation, trackCardDismiss } = useTrackingCardEvent({
    cardName: CardName.INTRODUCE_INVITE_LINK,
    cardPurpose: CardPurpose[CardName.INTRODUCE_INVITE_LINK],
  });
  const { onKeyDown } = useKeyboardAccessibility();

  const closeBanner = () => {
    setIsShowBanner(false);
    inviteLinkSidebarLocalStorage.setCloseStatus(orgId);
  };

  const closeAddMemberModal = () => {
    setOpenAddMemberModal(false);
    closeBanner();
  };

  const onConfirm = () => {
    trackCardConfirmation();
    setOpenAddMemberModal(true);
  };

  const onDismiss = () => {
    trackCardDismiss();
    closeBanner();
  };

  useEffect(() => {
    trackCardViewed();
  }, []);

  return (
    <>
      <div className={styles.wrapper}>
        <IconButton
          size="sm"
          icon="x-md"
          className={styles.closeButton}
          iconColor="var(--kiwi-colors-surface-surface-container-low)"
          onClick={onDismiss}
        />
        <AvatarGroup
          size="xs"
          variant="outline"
          max={5}
          total={5}
          propsItems={avatars.map((member) => ({
            src: member.src,
            name: member.name,
          }))}
          renderItem={(props) => (
            <Avatar {...props} role="button" tabIndex={0} onClick={onConfirm} onKeyDown={onKeyDown} />
          )}
        />
        <p className={styles.title}>{t('inviteLink.oneLinkToInviteYourWholeTeam')}</p>
        <Button variant="text" size="md" className={styles.button} onClick={onConfirm}>
          {t('inviteLink.shareAnInviteLink')}
        </Button>
      </div>
      {isOpenAddMemberModal && (
        <AddMemberOrganizationModal
          open
          onClose={closeAddMemberModal}
          onSaved={closeAddMemberModal}
          updateCurrentOrganization={() => {}}
        />
      )}
    </>
  );
};

export default PromptInviteLinkBanner;
