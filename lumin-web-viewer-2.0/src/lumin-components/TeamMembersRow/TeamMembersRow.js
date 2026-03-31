/* eslint-disable react/prop-types */
/**
 * need to disable proptypes linter because it checks the member.role, we should refactor _renderPopperContent function
 */
import Grid from '@mui/material/Grid';
import MenuList from '@mui/material/MenuList';
import { capitalize } from 'lodash';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { Trans } from 'react-i18next';

import { LIST_MEMBER_TO_SHOW, ROLE } from 'screens/Teams/TeamConstant';

import Icomoon from 'lumin-components/Icomoon';
import PopperButton from 'lumin-components/PopperButton';
import MenuItem from 'lumin-components/Shared/MenuItem';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import Skeleton from 'luminComponents/Shared/Skeleton';
import SvgElement from 'luminComponents/SvgElement';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { organizationServices, teamServices } from 'services';

import logger from 'helpers/logger';

import { avatar, string, toastUtils, orgUtil, commonUtils } from 'utils';
import errorExtract from 'utils/error';

import { ModalTypes, Colors, ErrorCode, LOGGER } from 'constants/lumin-common';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { SOCKET_TYPE } from 'constants/teamConstant';

import { socket } from '../../socket';
import './TeamMembersRow.scss';

const propTypes = {
  currentUser: PropTypes.object,
  member: PropTypes.object,
  listToShow: PropTypes.string,
  openModal: PropTypes.func,
  team: PropTypes.object,
  loading: PropTypes.bool,
  updateModalProperties: PropTypes.func,
  closeModal: PropTypes.func,
  refetchTeam: PropTypes.func,
  refetchList: PropTypes.func,
  openErrorModal: PropTypes.func,
  onRemoved: PropTypes.func,
  currentOrganization: PropTypes.object,
};

const defaultProps = {
  openModal: () => {},
  currentUser: {},
  member: {},
  team: {},
  listToShow: LIST_MEMBER_TO_SHOW.MEMBER,
  loading: false,
  updateModalProperties: () => {},
  closeModal: () => {},
  refetchTeam: () => {},
  refetchList: () => {},
  openErrorModal: () => {},
  onRemoved: () => {},
  currentOrganization: {},
};

function TeamMembersRow(props) {
  const {
    team,
    member,
    currentUser,
    openModal,
    listToShow,
    loading,
    updateModalProperties,
    closeModal,
    refetchList,
    refetchTeam,
    openErrorModal,
    onRemoved,
    currentOrganization,
  } = props;

  const { _id: teamId } = team;
  const { _id: currentUserId, name } = currentUser;
  const closePopper = useRef(null);
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const withClosePopper = (callback) => async () => {
    await callback();
    if (closePopper?.current) {
      closePopper.current();
    }
  };

  const onChanged = async () => {
    try {
      refetchList();
      await refetchTeam();
    } catch (e) {
      toastUtils.openUnknownErrorToast();
    }
  };

  function _isOwner() {
    return team.owner._id === currentUserId;
  }

  function _isHigherRole(higherRole, lowerRole) {
    return (
      (higherRole === ROLE.ADMIN.toLowerCase() && lowerRole === ROLE.MODERATOR.toLowerCase()) ||
      (higherRole === ROLE.ADMIN.toLowerCase() && lowerRole === ROLE.MEMBER.toLowerCase()) ||
      (higherRole === ROLE.MODERATOR.toLowerCase() && lowerRole === ROLE.MEMBER.toLowerCase())
    );
  }

  const openScheduledDeleteModal = () => {
    const { _id: orgId } = currentOrganization;
    const onConfirm = () => organizationServices.reactiveOrganization(orgId);
    const setting = orgUtil.getScheduledDeleteOrgModalSettings(currentOrganization, onConfirm);
    openModal(setting);
  };

  async function _removeMember() {
    try {
      const memberId = member.user._id;
      await organizationServices.removeOrganizationTeamMember({ teamId, userId: memberId });
      socket.emit(SOCKET_EMIT.REMOVE_TEAMMEMBER, {
        teamId,
        userId: memberId,
        actorName: name,
        type: SOCKET_TYPE.REMOVE_MEMBER,
      });
      toastUtils.success({
        message: t('teamMember.memberHasBeenRemoved'),
      });
      onChanged();
      onRemoved();
    } catch (e) {
      const { code: errorCode } = errorExtract.extractGqlError(e);
      if (errorCode === ErrorCode.Org.SCHEDULED_DELETE) {
        openScheduledDeleteModal();
      } else {
        openErrorModal();
      }
    }
  }

  function _confirm({ onConfirm, targetName }) {
    const removeMemberMessage = (
      <Trans
        i18nKey="teamMember.removeMemberMessage"
        components={{ b: <b className={isEnableReskin ? 'kiwi-message--primary' : ''} />, br: <br /> }}
        values={{ targetName }}
      />
    );
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('teamMember.removeMember1'),
      message: removeMemberMessage,
      confirmButtonTitle: t('common.remove'),
      onCancel: () => {},
      onConfirm,
      useReskinModal: true,
      className: 'MaterialDialog__custom',
    };
    openModal(modalSettings);
  }

  async function _removeInvitedMember() {
    try {
      await teamServices.removeInvitedMember({ teamId, email: member.email });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('teamMember.memberHasBeenRemoved'),
      });
      onChanged();
      onRemoved();
    } catch (e) {
      openErrorModal();
    }
  }

  const _showTransferWarning = () => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('teamMember.titleTransfer', { name: member.user.name }),
      message: t('teamMember.messageTransfer'),
      confirmButtonTitle: t('teamMember.transfer'),
      closeOnConfirm: false,
      onCancel: () => {},
      // eslint-disable-next-line no-use-before-define
      onConfirm: _onTransferTeamAdmin,
    };
    openModal(modalSettings);
  };

  const _onTransferTeamAdmin = async () => {
    try {
      updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      });
      logger.logInfo({
        message: LOGGER.EVENT.CHANGE_ROLE_TEAM,
        reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      });
      await teamServices.transferTeamOwnership(team._id, member.user._id);

      // reload team page.
      refetchList();
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('teamMember.ownershipHasBeenTransferred'),
      });
    } finally {
      closeModal();
    }
  };

  function _renderPopperContent({ closePopper: closePopperCallback }) {
    closePopper.current = closePopperCallback;
    return (
      <MenuList>
        {_isOwner() && member.role !== ROLE.ADMIN.toLowerCase() && (
          <MenuItem onClick={withClosePopper(_showTransferWarning)}>
            <Icomoon className="user" size={18} />
            {t('teamMember.makeTeamAdmin')}
          </MenuItem>
        )}
        <MenuItem onClick={withClosePopper(() => _confirm({ onConfirm: _removeMember, targetName: member.user.name }))}>
          <Icomoon className="trash" size={18} /> {commonUtils.formatTitleCaseByLocale(t('teamMember.removeMember'))}
        </MenuItem>
      </MenuList>
    );
  }

  const _renderTeamMemberRole = () => {
    const roleText = member.isOwner ? ROLE.OWNER : member.role;
    const cssRole = roleText.toLowerCase().replace(' ', '_');
    const role = t(`common.${roleText.toLowerCase()}`);
    return <span className={`TeamMembersRow__role ${cssRole}`}>{capitalize(role)}</span>;
  };

  if (loading) {
    return (
      <Grid container className="TeamMembersRow">
        <Grid item sm={5} xs={11} className="TeamMembersRow__col">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="TeamMembersRow__indentity-wrapper">
            <Skeleton variant="text" width="80%" />
          </div>
        </Grid>
        <Grid item sm={2} className="TeamMembersRow__col hide-in-mobile">
          <Skeleton variant="text" width="50%" />
        </Grid>
        <Grid item sm={4} className="TeamMembersRow__col hide-in-mobile">
          <Skeleton variant="text" width="70%" />
        </Grid>
        <Grid item sm={1} xs={1} className="TeamMembersRow__col">
          <Skeleton variant="rectangular" width={20} height={30} />
        </Grid>
      </Grid>
    );
  }

  if (listToShow === LIST_MEMBER_TO_SHOW.PENDING_MEMBER) {
    return (
      <Grid container className="TeamMembersRow">
        <Grid item sm={5} xs={11} className="TeamMembersRow__col">
          <SvgElement
            className="TeamMembersRow__pendingUserAvatar"
            styleInline={false}
            content="invited-user"
            alt="Invited user"
          />
          <div className="TeamMembersRow__indentity-wrapper">
            <p className="TeamMembersRow__indentity">
              <span className="TeamMembersRow__email">{member.email}</span>
            </p>
            <span
              className={`TeamMembersRow__role ${
                member.isOwner ? ROLE.OWNER.toLowerCase() : member.role
              } hide-in-tablet hide-in-desktop`}
            >
              {member.isOwner ? ROLE.OWNER.toLowerCase() : member.role}
            </span>
          </div>
        </Grid>
        <Grid item sm={2} className="TeamMembersRow__col hide-in-mobile">
          <p className={`TeamMembersRow__role ${member.role}`}>{capitalize(member.role)}</p>
        </Grid>
        <Grid item sm={4} className="TeamMembersRow__col hide-in-mobile" />
        <Grid item sm={1} xs={1} className="TeamMembersRow__col TeamMembersRow__option">
          {(_isOwner() || _isHigherRole(team.roleOfUser, member.role)) && (
            <Icomoon
              className="trash"
              color={Colors.SECONDARY}
              onClick={() =>
                _confirm({
                  onConfirm: _removeInvitedMember,
                  targetName: string.getShortStringWithLimit(member.email, 25),
                })
              }
            />
          )}
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container className="TeamMembersRow TeamMembersRow--members">
      <Grid item sm={5} xs={11} className="TeamMembersRow__col">
        <MaterialAvatar
          containerClasses="TeamMembersRow__avatar"
          src={avatar.getAvatar(member.user.avatarRemoteId)}
          size={40}
        >
          {avatar.getTextAvatar(member.user.name)}
        </MaterialAvatar>
        <div className="TeamMembersRow__indentity-wrapper">
          <p className="TeamMembersRow__indentity">
            <span className="TeamMembersRow__name">{member.user.name}</span>
            {member.user._id === currentUserId && (
              <span className="TeamMebersRow__yourself">&nbsp;({t('common.you')})</span>
            )}
          </p>
          <p className="TeamMembersRow__email hide-in-tablet hide-in-desktop">{_renderTeamMemberRole()}</p>
          <p className="TeamMembersRow__email hide-in-tablet hide-in-desktop">{member.user.email}</p>
        </div>
      </Grid>
      <Grid item sm={2} className="TeamMembersRow__col hide-in-mobile">
        {_renderTeamMemberRole()}
      </Grid>
      <Grid item sm={4} className="TeamMembersRow__col hide-in-mobile">
        <p className="TeamMembersRow__email">{member.user.email}</p>
      </Grid>
      <Grid item sm={1} xs={1} className="TeamMembersRow__col TeamMembersRow__option">
        {member.user._id !== currentUserId && (_isOwner() || _isHigherRole(team.roleOfUser, member.role)) && (
          <PopperButton
            classes="TeamMembersRow__button"
            popperProps={{
              classes: 'TeamMembersRow__col popper',
              placement: 'bottom-end',
            }}
            // eslint-disable-next-line react/jsx-no-bind
            renderPopperContent={_renderPopperContent}
          >
            <Icomoon className="more-v" color={Colors.SECONDARY} />
          </PopperButton>
        )}
      </Grid>
    </Grid>
  );
}

TeamMembersRow.propTypes = propTypes;
TeamMembersRow.defaultProps = defaultProps;

export default TeamMembersRow;
