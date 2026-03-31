/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DebouncedFunc } from 'lodash';
import { Text, Button, Dialog } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import SearchInput from 'luminComponents/Shared/SearchInput';

import CollaboratorsList from 'features/CNC/CncComponents/InviteCollaborators/component/CollaboratorsList';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import styles from './InvitePeople.module.scss';

const InvitePeople = ({
  selectedUsers,
  isSearching,
  searchResults,
  onChange,
  onSelectUser,
  loading,
  renderResult,
  setSelectedUsers,
  onCloseModal,
  onInvite,
  allUsers,
}: {
  selectedUsers: InviteToOrganizationInput[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<InviteToOrganizationInput[]>>;
  isSearching: boolean;
  searchResults: IUserResult[];
  onChange: DebouncedFunc<(searchText: string) => Promise<void>>;
  onSelectUser: (member: InviteToOrganizationInput) => void;
  onRemoveUser: (userEmail: string) => void;
  loading: boolean;
  renderResult: (resultProps: any) => JSX.Element;
  onCloseModal: () => void;
  onInvite: () => Promise<void>;
  allUsers: IUserResult[];
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      opened
      centered
      size="sm"
      padding="md"
      onClose={onCloseModal}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <div className={styles.paper}>
        <Text className={styles.title} type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
          {t('memberPage.inviteCollaborators')}
        </Text>
        <div className={styles.descriptionWrapper}>
          <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
            {t('inviteCollaboratorsModal.activatedFreeTrial')}
          </Text>
          <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
            {t('inviteCollaboratorsModal.selectInvite')}
          </Text>
        </div>
        <div className={styles.content}>
          <div className={styles.input}>
            <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
              {t('setUpOrg.searchToInviteOthersViaEmail')}
            </Text>
            <SearchInput
              // @ts-ignore
              loading={isSearching}
              disabled={loading}
              options={searchResults}
              resultComponent={renderResult}
              onSelect={onSelectUser}
              onChange={onChange}
              placeholder={String(t('modalShare.enterEmailAddres'))}
              fullWidth
              isReskin
            />
          </div>
          <div className={styles.contentWrapper}>
            <CollaboratorsList selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} allUsers={allUsers} />
          </div>
          <div className={styles.actions}>
            <Button size="lg" variant="text" onClick={onCloseModal}>
              {t('inviteCollaboratorsModal.skip')}
            </Button>
            <Button
              size="lg"
              variant="filled"
              onClick={onInvite}
              disabled={!selectedUsers.length}
              loading={loading}
              data-lumin-btn-name={CNCButtonName.INVITE_COLLABORATORS}
              data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.INVITE_COLLABORATORS]}
            >
              {t('inviteCollaboratorsModal.inviteForFree')}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default InvitePeople;
