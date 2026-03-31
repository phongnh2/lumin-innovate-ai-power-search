import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import AddMemberOrganizationModal from 'luminComponents/AddMemberOrganizationModal';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import styles from './InviteMembersButton.module.scss';

const InviteMembersButton = () => {
  const { t } = useTranslation();
  const [isOpenAddMemberModal, setOpenAddMemberModal] = useState(false);

  return (
    <>
      <Button
        variant="elevated"
        size="md"
        startIcon={<Icomoon type="user-plus-md" size="md" />}
        className={styles.inviteMembersButton}
        onClick={() => setOpenAddMemberModal(true)}
        data-lumin-btn-name={ButtonName.INVITE_MEMBERS_TOP_RIGHT}
      >
        {t('workspaceSwitcher.inviteMembers')}
      </Button>
      {isOpenAddMemberModal && (
        <AddMemberOrganizationModal
          open
          onClose={() => setOpenAddMemberModal(false)}
          onSaved={() => setOpenAddMemberModal(false)}
          updateCurrentOrganization={() => {}}
        />
      )}
    </>
  );
};

export default InviteMembersButton;
