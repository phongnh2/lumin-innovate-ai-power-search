import { Dialog, Collapse } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { ActionButtons, InviteesList, PromptSection, SearchSection } from './components';
import { useGetSuggestedUsers, useSubmit, useTrackingInviteToAddDocStackEvent } from './hooks';
import { User, UserPayload } from './InvitesToAddDocStackModal.types';

import styles from './InvitesToAddDocStackModal.module.scss';

const InvitesToAddDocStackModal = () => {
  const dispatch = useDispatch();

  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserPayload[]>([]);

  const { isFetching, data: suggestedUsers } = useGetSuggestedUsers();
  const { trackModalDismiss, trackModalSubmit } = useTrackingInviteToAddDocStackEvent();

  useEffect(() => {
    if (isFetching || !suggestedUsers?.length) {
      return;
    }
    setUserList(suggestedUsers);
    setSelectedUsers(
      suggestedUsers.map((user) => ({
        email: user.email,
        role: ORGANIZATION_ROLES.MEMBER,
      }))
    );
  }, [isFetching, suggestedUsers]);

  const handleClose = () => {
    dispatch(actions.closeModal());
  };

  const { isSubmitting, handleSubmit } = useSubmit({
    data: selectedUsers,
    onSuccess: handleClose,
    trackModalSubmit,
    userList,
  });

  return (
    <Dialog opened centered size="sm" closeOnClickOutside={false} closeOnEscape={false} onClose={handleClose}>
      <div className={styles.container}>
        <PromptSection />
        <SearchSection
          isSubmitting={isSubmitting}
          setSelectedUsers={setSelectedUsers}
          setUserList={setUserList}
          userList={userList}
        />
        <Collapse in={userList.length > 0}>
          <InviteesList userList={userList} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
        </Collapse>
        <ActionButtons
          onDismiss={() => {
            trackModalDismiss().finally(() => {});
            handleClose();
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          canSubmit={Boolean(selectedUsers.length)}
        />
      </div>
    </Dialog>
  );
};

export default InvitesToAddDocStackModal;
