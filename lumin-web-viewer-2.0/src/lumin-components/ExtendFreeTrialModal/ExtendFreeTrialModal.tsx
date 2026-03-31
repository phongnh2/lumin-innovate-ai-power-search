/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect } from 'react';

import AddMemberOrganizationModal from 'luminComponents/AddMemberOrganizationModal/AddMemberOrganizationModal';
import UserResults from 'luminComponents/Shared/UserResults';
import EditorThemeProvider from 'luminComponents/ViewerCommonV2/ThemeProvider';

import { useGetCurrentOrganization, useTranslation } from 'hooks';
import useGetFlagExtendFreeTrial, { VARIANT_EXTEND_FREE_TRIAL } from 'hooks/useGetFlagExtendFreeTrial';

import { CNC_SESSION_STORAGE_KEY } from 'features/CNC/constants/customConstant';
import { CNCModalName } from 'features/CNC/constants/events/modal';
import useTrackingABTestModalEvent from 'features/CNC/hooks/useTrackingABTestModalEvent';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { SearchUserStatus } from 'constants/lumin-common';

import { IUserResult } from 'interfaces/user/user.interface';

import ExtendTrialDay from './components/ExtendTrialDay';
import InvitePeople from './components/InvitePeople';
import useHandleSearchUsers from './hooks/useHandleSearchUsers';
import useInviteMembers from './hooks/useInviteMembers';

type Props = {
  onClose: () => void;
};

type ResultProps = {
  data: IUserResult;
  onClick: () => void;
  selected: boolean;
  isReskin?: boolean;
};

const MODAL_NAME = {
  [VARIANT_EXTEND_FREE_TRIAL.DISMISS_BY_MODAL]: CNCModalName.EXTEND_FREE_TRIAL_MODAL,
  [VARIANT_EXTEND_FREE_TRIAL.INVITE_LINK]: CNCModalName.INVITE_MEMBER_TO_WORKSPACE_BY_CREATE_LINK,
  [VARIANT_EXTEND_FREE_TRIAL.PREFILL_USERS]: CNCModalName.INVITE_MEMBER_TO_WORKSPACE,
};

const ExtendFreeTrialModal = ({ onClose }: Props): JSX.Element => {
  const { variant } = useGetFlagExtendFreeTrial();
  const { t } = useTranslation();

  const modalName = variant ? MODAL_NAME[variant] : CNCModalName.EXTEND_FREE_TRIAL_MODAL;
  const { trackModalConfirmation, trackModalDismiss } = useTrackingABTestModalEvent({
    modalName,
    hotjarEvent: HOTJAR_EVENT.EXTEND_FREE_TRIAL_MODAL_VIEWED,
  });

  const {
    searchResults,
    selectedUsers,
    onChange,
    isSearching,
    onSelectUser,
    onRemoveUser,
    setSelectedUsers,
    allUsers,
    prioritizedUserCollaborators,
    onRemoveTag,
  } = useHandleSearchUsers();

  const currentOrganization = useGetCurrentOrganization();
  const isInviteLinkVariant = variant === VARIANT_EXTEND_FREE_TRIAL.INVITE_LINK;
  const isExtraTrial = variant === VARIANT_EXTEND_FREE_TRIAL.DISMISS_BY_MODAL;

  const { loading, onInvite, onCloseModal } = useInviteMembers({
    selectedUsers,
    onClose,
    trackModalConfirmation,
    trackModalDismiss,
    userCollaborators: prioritizedUserCollaborators,
    isExtraTrial,
  });

  useEffect(() => {
    sessionStorage.setItem(CNC_SESSION_STORAGE_KEY.HAS_SHOW_INVITE_COLLABORATORS_MODAL, 'true');
  }, []);

  const renderResult = useCallback((resultProps: ResultProps) => {
    const tooltip = {
      [SearchUserStatus.USER_ADDED]: t('memberPage.addMemberModal.userAdded'),
      [SearchUserStatus.USER_UNAVAILABLE]: t('memberPage.addMemberModal.userUnavailable'),
      [SearchUserStatus.USER_RESTRICTED]: t('memberPage.addMemberModal.userRestricted'),
    }[resultProps.data?.status];
    return (
      <PlainTooltip content={tooltip} maw="none" position="top" offset={-40}>
        <div>
          <UserResults {...resultProps} />
        </div>
      </PlainTooltip>
    );
  }, []);

  // Handle invite link variant
  if (isInviteLinkVariant) {
    return (
      <AddMemberOrganizationModal
        open
        onClose={onCloseModal}
        // @ts-ignore
        onSaved={onCloseModal}
        selectedOrganization={currentOrganization}
        updateCurrentOrganization={() => {}}
        updateOrganizationInList={() => {}}
        from={FeatureFlags.MODAL_EXTRA_FREE_TRIAL_DAYS}
      />
    );
  }

  return (
    <EditorThemeProvider>
      {isExtraTrial ? (
        <ExtendTrialDay
          onCloseModal={onCloseModal}
          loading={loading}
          onInvite={onInvite}
          searchResults={searchResults}
          onChange={onChange}
          onSelectUser={onSelectUser}
          onRemoveUser={onRemoveTag}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          allUsers={allUsers}
          isSearching={isSearching}
          renderResult={renderResult}
        />
      ) : (
        <InvitePeople
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          isSearching={isSearching}
          searchResults={searchResults}
          onChange={onChange}
          onSelectUser={onSelectUser}
          onRemoveUser={onRemoveUser}
          loading={loading}
          renderResult={renderResult}
          onCloseModal={onCloseModal}
          onInvite={onInvite}
          allUsers={allUsers}
        />
      )}
    </EditorThemeProvider>
  );
};

export default ExtendFreeTrialModal;
