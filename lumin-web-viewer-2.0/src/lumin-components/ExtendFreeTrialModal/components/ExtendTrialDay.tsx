/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button, ButtonSize, ButtonVariant, Dialog, IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import SearchInput from 'lumin-components/Shared/SearchInput';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import AddUserCollaborator from 'features/CNC/CncComponents/ExtraFreeTrialModal/components/AddUserCollaborators';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import styles from '../ExtendFreeTrialModal.module.scss';

const ExtendTrialDay = ({
  onCloseModal,
  loading,
  onInvite,
  searchResults,
  onChange,
  onSelectUser,
  onRemoveUser,
  setSelectedUsers,
  allUsers,
  isSearching,
  selectedUsers,
  renderResult,
}: {
  onCloseModal: () => void;
  loading: boolean;
  onInvite: () => Promise<void>;
  searchResults: IUserResult[];
  onChange: (value: string) => void;
  onSelectUser: (user: IUserResult) => void;
  onRemoveUser: (userEmail: string) => void;
  setSelectedUsers: (users: InviteToOrganizationInput[]) => void;
  allUsers: IUserResult[];
  isSearching: boolean;
  selectedUsers: InviteToOrganizationInput[];
  renderResult: (resultProps: any) => JSX.Element;
}) => {
  const { t } = useTranslation();

  const getCustomProps = () => ({
    styles: {
      root: {
        '--modal-padding': 'var(--kiwi-spacing-4) var(--kiwi-spacing-3)',
      },
    },
  });
  const customProps = getCustomProps();

  return (
    <Dialog
      opened
      centered
      size="sm"
      closeOnClickOutside={false}
      closeOnEscape={false}
      onClose={onCloseModal}
      {...customProps}
    >
      <div className={styles.container}>
        <IconButton size="md" icon="x-md" className={styles.closeButton} onClick={onCloseModal} />
        <div className={styles.headerWrapper}>
          <SvgElement content="icon-three-stars" width={24} height={24} />
          <div className={styles.header}>{t('inviteCollaboratorsModal.congratulations')}</div>
        </div>
        <p className={styles.title}>{t('inviteCollaboratorsModal.addExtraDays')}</p>
        <div className={styles.description}>{t('inviteCollaboratorsModal.extraDaysDescription')}</div>
        <div className={styles.input}>
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
            shouldShowTagList={selectedUsers.length > 0}
            tagList={selectedUsers}
            handleRemoveTag={onRemoveUser}
          />

          <AddUserCollaborator
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            userCollaborators={allUsers}
          />
        </div>

        <div className={styles.buttonWrapper}>
          <Button
            variant={ButtonVariant.filled}
            size={ButtonSize.lg}
            className={styles.button}
            onClick={onInvite}
            disabled={!selectedUsers.length}
            data-lumin-btn-name={ButtonName.INVITE_MEMBER_TO_EXTEND_FREE_TRIAL}
          >
            {t('memberPage.invite')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
export default ExtendTrialDay;
