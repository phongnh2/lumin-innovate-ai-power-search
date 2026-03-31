/* eslint-disable react/jsx-no-bind */
import classNames from 'classnames';
import { debounce, reject } from 'lodash';
import { InlineMessage, Modal, ScrollArea, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { batch } from 'react-redux';

import ModalFooter from 'lumin-components/ModalFooter';
import CustomScroll from 'lumin-components/Shared/CustomScroll';
import AvatarUploader from 'luminComponents/AvatarUploader';
import Dialog from 'luminComponents/Dialog';
import MemberItem from 'luminComponents/MemberItem';
import { TextInput } from 'luminComponents/ReskinLayout/components/TextInput';
import SearchResultItem from 'luminComponents/SearchResultItem';
import Alert from 'luminComponents/Shared/Alert';
import Input from 'luminComponents/Shared/Input';
import SearchInput from 'luminComponents/Shared/SearchInput';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { organizationServices, userServices } from 'services';

import { isMobile } from 'helpers/device';

import { validator, toastUtils, commonUtils, avatar } from 'utils';

import { maximumAvatarSize, TOAST_DURATION_ERROR_INVITE_MEMBER } from 'constants/customConstant';
import {
  ModalTypes, STATUS_CODE, DEBOUNCED_SEARCH_TIME, SearchUserStatus, EntitySearchType,
} from 'constants/lumin-common';
import {
  WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER,
} from 'constants/messages';
import { Colors } from 'constants/styles';
import { TEAM_ROLES } from 'constants/teamConstant';

import OrganizationTeamRole from './components/OrganizationTeamRole';
import { ROLE } from '../../screens/Teams/TeamConstant';
import './CreateTeamModal.scss';

import styles from './CreateTeamModal.module.scss';

const propTypes = {
  currentUser: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  currentOrganization: PropTypes.object,
  onCreate: PropTypes.func.isRequired,
};

const defaultProps = {
  onClose: () => {},
  currentUser: {},
  currentOrganization: {},
};

function CreateTeamModal({
  currentUser,
  open,
  onClose,
  currentOrganization,
  onCreate,
}) {
  const { _id: organizationId } = currentOrganization?.data || {};
  const [file, setFile] = useState();
  const [isCreating, setCreating] = useState(false);
  const [members, setMembers] = useState([
    { user: { ...currentUser, isAdded: true }, role: ROLE.ADMIN.toLowerCase() },
  ]);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [nameValidationError, setNameValidationError] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const currentEmail = useRef('');
  const membersRef = useRef(members);
  const searchMemberDebounced = useRef(debounce(searchUser, DEBOUNCED_SEARCH_TIME)).current;
  const isDisableCreate = Boolean(error) || Boolean(nameValidationError) || !teamName?.trim() || isCreating;
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const addMemberToOrgTeam = (member) => {
    const isStatusValid = member.status === SearchUserStatus.USER_VALID;
    if (isStatusValid) {
      setMembers((prevMembers) => ([...prevMembers, { user: member, role: ROLE.MEMBER.toLowerCase() }]));
      setResults((prevState) => reject(prevState, ['email', member.email]));
    }
  };

  const isAddedUser = (user) => membersRef.current.some((mem) => mem.user.email === user.email);

  const injectDataToResults = (user) => ({
    ...user,
    disabled: user.status !== SearchUserStatus.USER_VALID,
    status: isAddedUser(user) ? SearchUserStatus.USER_ADDED : user.status,
  });

  async function searchUser(searchingEmail) {
    try {
      setSearching(true);
      const searchResults = await userServices.findUser({
        searchKey: searchingEmail,
        targetId: organizationId,
        targetType: EntitySearchType.ORGANIZATION_TEAM_CREATION,
        excludeUserIds: membersRef.current.map((m) => m.user._id),
      });
      currentEmail.current = searchingEmail;
      setResults(
        searchResults.map(injectDataToResults),
      );
    } catch (err) {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  const removeMember = (member) => {
    setMembers(
      members.filter((memberItem) => memberItem.user._id !== member.user._id),
    );
  };

  function _renderRoleButton(member) {
    return <OrganizationTeamRole
      onClick={() => removeMember(member)}
      member={member}
      currentUser={currentUser}
    />;
  }

  const removeInvitedMember = (member) => {
    setInvitedMembers(
      invitedMembers.filter(
        (memberItem) => memberItem.email !== member.email,
      ),
    );
  };

  function _renderInvitedMemberRole(member) {
    return <OrganizationTeamRole
      onClick={() => removeInvitedMember(member)}
      member={member}
      currentUser={currentUser}
    />;
  }

  const membersToAdd = members
    .filter((member) => member.user._id !== currentUser._id)
    .map((member) => ({
      userId: member.user._id,
      userEmail: member.user.email,
      role: member.role,
    }));

  const createTeam = async () => {
    try {
      setCreating(true);
      const newTeam = await createOrganizationTeam();
      onCreate(newTeam);
      onClose();
    } catch (e) {
      toastUtils.error({
        message: t('errorMessage.unknownError'),
      });
      setResults([]);
      setCreating(false);
    }
  };

  async function createOrganizationTeam() {
    const { organizationTeam: createdTeam, statusCode } = await organizationServices.createTeam({
      orgId: organizationId,
      team: {
        name: teamName,
      },
      members: {
        luminUsers: membersToAdd,
      },
      file,
    });
    switch (statusCode) {
      case STATUS_CODE.SUCCEED:
        toastUtils.openToastMulti({
          type: ModalTypes.SUCCESS,
          message: t('toast.spaceHasBeenCreated'),
        });
        break;
      case STATUS_CODE.BAD_REQUEST:
        toastUtils.openToastMulti({
          type: ModalTypes.WARNING,
          message: t(WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER),
          duration: TOAST_DURATION_ERROR_INVITE_MEMBER,
        });
        break;
      default:
        break;
    }
    return createdTeam;
  }

  function changeAvatar(uploadFile) {
    const reader = new FileReader();
    reader.readAsDataURL(uploadFile);
    reader.onload = () => batch(() => {
      setError('');
      setFile(uploadFile);
      setAvatarBase64(reader.result);
    });
  }

  function removeAvatar() {
    return batch(() => {
      setAvatarBase64('');
      setFile(null);
      setError('');
    });
  }

  function handleClose() {
    if (!isCreating) {
      setError('');
      onClose();
    }
  }

  const onChangeTeamName = (e) => {
    const targetValue = e.currentTarget.value;
    const currentTeamName = targetValue.trim();
    return batch(() => {
      setError('');
      setTeamName(targetValue);
      setNameValidationError(validator.validateTeamName(currentTeamName));
    });
  };

  const scrollBarsHeight = isMobile() ? 140 : 165;

  const renderResult = useCallback((resultProps) => <SearchResultItem.TeamMember {...resultProps} />, []);

  const membersListElement = (
    <>
      <span className="CreateTeamModal__memberTitle">{t('common.members')}</span>
      <CustomScroll
        autoHide
        autoHeight
        className="CreateTeamModal__members"
        autoHeightMax={scrollBarsHeight}
        autoHeightMin={scrollBarsHeight}
        hideTracksWhenNotNeeded
      >
        {members.map((member) => (
          <MemberItem
            key={member.user._id}
            user={member.user}
            moreRightElement
            rightElement={_renderRoleButton(member)}
            className="CreateTeamModal__memberItem"
            isOwner={member?.role === TEAM_ROLES.ADMIN}
          />
        ))}
        {invitedMembers.map((member) => (
          <MemberItem
            key={member.email}
            user={member}
            moreRightElement
            rightElement={_renderInvitedMemberRole(member)}
            className="CreateTeamModal__memberItem"
          />
        ))}
      </CustomScroll>
    </>
  );

  const membersListElementReskin = (
    <div className={styles.memberListWrapper}>
      <ScrollArea classNames={{ root: styles.memberListScrollRoot, viewport: styles.memberListScroll }}>
        <div className={styles.memberList}>
          {members.map((member) => (
            <MemberItem
              key={member.user._id}
              user={member.user}
              moreRightElement
              rightElement={_renderRoleButton(member)}
              isOwner={member?.role === TEAM_ROLES.ADMIN}
              isReskin
            />
          ))}
          {invitedMembers.map((member) => (
            <MemberItem
              key={member.email}
              user={member}
              moreRightElement
              rightElement={_renderInvitedMemberRole(member)}
              isReskin
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const addMemberElement = (
    <div className="CreateTeamModal__contentItem CreateTeamModal__contentItem--add-member">
      <div className="CreateTeamModal__labelWrapper">
        <span className="CreateTeamModal__label">
          {commonUtils.formatTitleCaseByLocale(t('common.addMembers'))}
          <span style={{ fontWeight: 400 }}> ({t('common.optional')}) </span>
        </span>
      </div>
      <SearchInput
        onChange={searchMemberDebounced}
        options={results}
        onSelect={addMemberToOrgTeam}
        resultComponent={renderResult}
        loading={searching}
        disabled={isCreating}
        placeholder={t('common.eg', { egText: 'lily@gmail.com' })}
      />
    </div>
  );

  const searchMemberElement = (
    <SearchInput
      onChange={searchMemberDebounced}
      options={results}
      onSelect={addMemberToOrgTeam}
      resultComponent={renderResult}
      loading={searching}
      disabled={isCreating}
      placeholder={t('common.eg', { egText: 'lily@gmail.com' })}
      label={t('common.addMembersOptional')}
      isReskin={isEnableReskin}
    />
  );

  const createTeamNameElement = (
    <div className="CreateTeamModal__contentItem CreateTeamModal__contentItem--team-name">
      <div className="CreateTeamModal__labelWrapper">
        <span className="CreateTeamModal__label">
          {t('teamCommon.name')}
          <span style={{ color: Colors.SECONDARY_50 }}>*</span>
        </span>
      </div>
      <Input
        onChange={onChangeTeamName}
        placeholder={t('common.eg', { egText: t('common.luminTeam') })}
        value={teamName}
        errorMessage={nameValidationError}
        onBlur={onChangeTeamName}
        showClearButton
        hideValidationIcon
        disabled={isCreating}
        classWrapper="CreateTeamModal__inputName"
        autoFocus
      />
    </div>
  );

  const teamNameElement = (
    <TextInput
      autoFocus
      onChange={onChangeTeamName}
      onBlur={onChangeTeamName}
      placeholder={t('common.eg', { egText: t('common.luminTeam') })}
      value={teamName}
      error={nameValidationError}
      disabled={isCreating}
      size="lg"
      label={t('teamCommon.name')}
    />
  );

  const uploadTeamPictureElement = (
    <div className="CreateTeamModal__contentItem">
      <div className="CreateTeamModal__labelWrapper">
        <span className="CreateTeamModal__label CreateTeamModal__label--noMargin">
          {t('teamCommon.uploadTeamPhoto')}
        </span>
      </div>
      <div
        className={classNames('CreateTeamModal__avatar-container', {
          'CreateTeamModal__avatar-container--emptyTeamName': !teamName,
        })}
      >
        <AvatarUploader
          disabled={isCreating}
          avatarSource={file ? avatarBase64 : null}
          targetName={teamName}
          onChange={changeAvatar}
          removeAvatar={removeAvatar}
          sizeLimit={maximumAvatarSize.TEAM}
          size={64}
          note={t('common.limitSizeImage', { size: avatar.getAvatarFileSizeLimit(maximumAvatarSize.TEAM) })}
          onError={setError}
          team
          isLogo
          showInModal
        />
      </div>
    </div>
  );

  const avatarElement = (
    <div className={styles.avatarSection}>
      <Text type="title" size="sm">
        {t('teamCommon.uploadTeamPhoto')}
      </Text>
      <AvatarUploader
        disabled={isCreating}
        avatarSource={file ? avatarBase64 : null}
        targetName={teamName}
        onChange={changeAvatar}
        removeAvatar={removeAvatar}
        sizeLimit={maximumAvatarSize.TEAM}
        size={64}
        note={t('common.limitSizeImage', { size: avatar.getAvatarFileSizeLimit(maximumAvatarSize.TEAM) })}
        onError={setError}
        team
        isLogo
        showInModal
        isReskin
      />
    </div>
  );

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    searchUser(currentEmail.current);
  }, [members.length, invitedMembers.length]);

  if (isEnableReskin) {
    return (
      <Modal opened={open} size="sm" title={t('teamCommon.createTeam')} onClose={handleClose}>
        {error && (
          <div>
            <InlineMessage type="error" message={error} />
          </div>
        )}
        {avatarElement}
        {teamNameElement}
        <div>
          {searchMemberElement}
          {membersListElementReskin}
        </div>
        <ModalFooter
          onSubmit={createTeam}
          label={t('action.create')}
          loading={isCreating}
          disabled={isDisableCreate}
          onCancel={handleClose}
          disabledCancel={isCreating}
          smallGap
          isReskin
        />
      </Modal>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="CreateTeamModal"
      disableBackdropClick={isCreating}
      disableEscapeKeyDown={isCreating}
      scroll="body"
    >
      <div className="CreateTeamModal__container">
        <h5 className="CreateTeamModal__title">{t('teamCommon.createTeam')}</h5>
        <div className="CreateTeamModal__content">
          {error && <Alert style={{ marginBottom: 12 }}>{error}</Alert>}

          { uploadTeamPictureElement }

          { createTeamNameElement }

          { addMemberElement }

          { membersListElement }
        </div>
        <ModalFooter
          onSubmit={createTeam}
          label={t('action.create')}
          loading={isCreating}
          disabled={isDisableCreate}
          onCancel={handleClose}
          disabledCancel={isCreating}
          className="CreateTeamModal__footer"
        />
      </div>
    </Dialog>
  );
}

CreateTeamModal.propTypes = propTypes;
CreateTeamModal.defaultProps = defaultProps;

export default CreateTeamModal;
