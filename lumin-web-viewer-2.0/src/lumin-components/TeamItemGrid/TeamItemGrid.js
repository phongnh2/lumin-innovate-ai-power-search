import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import ButtonMore from 'lumin-components/ButtonMore';
import Chip from 'lumin-components/Shared/Chip';
import Tooltip from 'lumin-components/Shared/Tooltip';
import Icomoon from 'luminComponents/Icomoon';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { useDesktopMatch, useTabletMatch, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { teamServices, organizationServices, socketServices as SocketServices } from 'services';

import { avatar, commonUtils, errorUtils, toastUtils } from 'utils';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { ModalTypes } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { Colors } from 'constants/styles';
import { TEAM_ROLES, SOCKET_TYPE, TEAM_TEXT, TEAMS_TEXT } from 'constants/teamConstant';

import { socket } from '../../socket';

import * as Styled from './TeamItemGrid.styled';

const EditTeamModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/EditTeamModal'));
const TeamTransferModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/TeamTransferModal'));

const MAXIMUM_MEMBER_AVATAR = 5;

function TeamItemGrid({
  team,
  currentUser,
  openModal,
  closeModal,
  navigate,
  currentOrganization,
  updateModalProperties,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isTabletMatch = useTabletMatch();
  const isDesktopMatch = useDesktopMatch();
  const { data: organization } = currentOrganization;
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const memberAvatarSize = isTabletMatch ? 30 : 22;
  const memberAvatarTextSize = isTabletMatch ? 12 : 10;
  const socketService = new SocketServices();

  const { onKeyDown } = useKeyboardAccessibility();

  const { _id: teamId } = team;

  function _onLeaveTeam() {
    if (team?.owner?._id === currentUser?._id && team?.totalMembers > 1) {
      return setOpenTransferModal(!openTransferModal);
    }

    const modalSettings = {
      open: true,
      type: ModalTypes.WARNING,
      confirmButtonTitle: t('common.leave'),
      title: t('teamListPage.leaveTeam1'),
      message: <Trans i18nKey="teamListPage.canNoLongerTeam" values={{ name: team.name }} components={{ b: <b /> }} />,
      onConfirm: () => withLoading(leaveOrgTeam),
      onCancel: () => {},
      closeOnConfirm: false,
    };
    openModal(modalSettings);
  }

  async function leaveOrgTeam() {
    try {
      await teamServices.leaveOrgTeam({ teamId });
      dispatch(actions.removeTeamInList(teamId));
      socketService.userLeaveTeam({ teamId, userId: currentUser?._id, orgId: organization._id });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('teamListPage.leaveTeamSuccessfully'),
      });
      closeModal();
    } catch (error) {
      const { code } = errorUtils.extractGqlError(error);
      errorUtils.handleCommonError({ errorCode: code, t });
      setIsDisabled(false);
    }
  }

  function _onRemoveTeam() {
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('teamListPage.deleteTeam1'),
      message: <Trans i18nKey="teamListPage.canNoLongerTeam" values={{ name: team.name }} components={{ b: <b /> }} />,
      onConfirm: () => withLoading(_removeTeam),
      onCancel: () => {},
      className: 'MaterialDialog__custom',
      closeOnConfirm: false,
    };
    openModal(modalSettings);
  }

  async function withLoading(func) {
    setIsDisabled(true);
    updateModalProperties({ isProcessing: true });
    await func();
  }

  async function _removeTeam() {
    const { _id: orgId, url: orgUrl } = organization || {};
    try {
      const response = await organizationServices.deleteOrganizationTeam(teamId);
      dispatch(actions.removeTeamInList(teamId));
      socket.emit(SOCKET_EMIT.DELETE_TEAM, {
        ...response,
        targetOrgUrl: orgUrl,
        targetOrgId: orgId,
        type: SOCKET_TYPE.DELETE_TEAM,
      });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('teamListPage.teamHasBeenDeleted'),
      });
      closeModal();
    } catch (error) {
      const { code } = errorUtils.extractGqlError(error);
      errorUtils.handleCommonError({ errorCode: code, t });
      setIsDisabled(false);
    }
  }

  const onViewClick = (event) => {
    const element = event.target.closest(`[data-button-more-id="${team._id}"]`);
    if (!element) {
      const link = `/${ORG_TEXT}/${organization.url}/documents/${TEAM_TEXT}/${team._id}`;
      navigate(link);
    }
  };

  const withClosePopper = (callback, closePopper) => () => {
    callback();
    closePopper();
  };

  const onClickEditTeam = (closePopper) => {
    closePopper();
    setOpenEditModal(true);
  };

  const onClickViewMembers = () => {
    const link = `/${ORG_TEXT}/${organization.url}/${TEAMS_TEXT}/${team._id}/members`;
    navigate(link);
  };

  // eslint-disable-next-line react/prop-types
  const _renderEditTeamOption = (closePopper) =>
    team?.roleOfUser !== TEAM_ROLES.MEMBER && (
      <Styled.ActionItem key="edit_team" onClick={() => onClickEditTeam(closePopper)}>
        <Icomoon className="edit-team" size={16} color={Colors.NEUTRAL_80} />
        <Styled.ActionTitle>{t('teamListPage.editTeam')}</Styled.ActionTitle>
      </Styled.ActionItem>
    );

  // eslint-disable-next-line react/prop-types
  const _renderLeaveTeamOption = (closePopper) =>
    team?.totalMembers > 1 && (
      <Styled.ActionItem key="leave_team" onClick={withClosePopper(_onLeaveTeam, closePopper)}>
        <Icomoon className="leave-group" size={16} color={Colors.NEUTRAL_80} />
        <Styled.ActionTitle>{t('teamListPage.leaveTeam')}</Styled.ActionTitle>
      </Styled.ActionItem>
    );

  // eslint-disable-next-line react/prop-types
  const _renderDeleteTeamOption = (closePopper) =>
    team?.owner?._id === currentUser?._id && (
      <Styled.ActionItem key="delete_team" onClick={withClosePopper(_onRemoveTeam, closePopper)}>
        <Icomoon className="trash" size={16} color={Colors.NEUTRAL_80} />
        <Styled.ActionTitle>{t('teamListPage.deleteTeam')}</Styled.ActionTitle>
      </Styled.ActionItem>
    );

  const _renderViewMembersOption = () => (
    <Styled.ActionItem key="view_members" onClick={() => onClickViewMembers()}>
      <Icomoon className="users" size={20} color={Colors.NEUTRAL_80} />
      <Styled.ActionTitle>{commonUtils.formatTitleCaseByLocale(t('teamListPage.viewMembers'))}</Styled.ActionTitle>
    </Styled.ActionItem>
  );

  // eslint-disable-next-line react/prop-types
  const _renderPopperContent = ({ closePopper }) => (
    <Styled.CustomMenu>
      {_renderViewMembersOption()}
      {_renderEditTeamOption(closePopper)}
      {_renderLeaveTeamOption(closePopper)}
      {_renderDeleteTeamOption(closePopper)}
    </Styled.CustomMenu>
  );

  const isOwner = currentUser._id === team.owner._id;

  const avatarBase64 = localStorage.getItem(`avatar_${team?._id}`);
  const avatarSource = avatarBase64 || avatar.getAvatar(team.avatarRemoteId);

  const role = isOwner ? t('common.teamAdmin') : t('common.member');

  const renderAdditionalMemberAvatars = () => {
    if (team.totalMembers < MAXIMUM_MEMBER_AVATAR) {
      return null;
    }
    if (team.totalMembers === MAXIMUM_MEMBER_AVATAR) {
      return (
        <Styled.MemberAvatarItem>
          <MaterialAvatar
            containerClasses="TeamItemGrid__members__avatar"
            size={memberAvatarSize}
            fontSize={memberAvatarTextSize}
            hasBorder
            src={avatar.getAvatar(team.members[MAXIMUM_MEMBER_AVATAR - 1].avatarRemoteId)}
          >
            {avatar.getTextAvatar(team.members[MAXIMUM_MEMBER_AVATAR - 1].name)}
          </MaterialAvatar>
        </Styled.MemberAvatarItem>
      );
    }
    return (
      <Styled.MemberAvatarItem>
        <MaterialAvatar
          containerClasses="TeamItemGrid__members__avatar"
          size={memberAvatarSize}
          fontSize={memberAvatarTextSize}
          hasBorder
        >
          <Styled.RemainingMemberNumber>+{team.totalMembers - 4}</Styled.RemainingMemberNumber>
        </MaterialAvatar>
      </Styled.MemberAvatarItem>
    );
  };

  const renderTeamMembersAvatars = () => {
    if (!team.totalMembers) {
      return null;
    }
    return team.members.slice(0, 4).map((member) => (
      <Styled.MemberAvatarItem key={member._id}>
        <MaterialAvatar
          size={memberAvatarSize}
          fontSize={memberAvatarTextSize}
          hasBorder
          src={avatar.getAvatar(member.avatarRemoteId)}
        >
          {avatar.getTextAvatar(member.name)}
        </MaterialAvatar>
      </Styled.MemberAvatarItem>
    ));
  };

  return (
    <div>
      <Styled.Container
        role="button"
        tabIndex={0}
        onClick={onViewClick}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Styled.ItemHeader>
          <Chip
            label={role}
            color={isOwner ? Colors.PRIMARY_80 : Colors.NEUTRAL_60}
            backgroundColor={isOwner ? Colors.PRIMARY_20 : Colors.NEUTRAL_10}
          />
          <Styled.ActionButtonWrapper>
            <div data-button-more-id={team._id}>
              <ButtonMore contentPopper={_renderPopperContent} isDisabled={isDisabled} tabIndex={isHovered ? 0 : -1} />
            </div>
          </Styled.ActionButtonWrapper>
        </Styled.ItemHeader>

        <Styled.ItemContent>
          <Styled.TeamAvatarWrapper>
            <MaterialAvatar src={avatarSource} size={isDesktopMatch ? 56 : 46} fontSize={isDesktopMatch ? 24 : 17}>
              {avatar.getTextAvatar(team.name)}
            </MaterialAvatar>
          </Styled.TeamAvatarWrapper>
          <Tooltip title={team?.name}>
            <Styled.TeamName>{team?.name}</Styled.TeamName>
          </Tooltip>

          <Styled.MemberAvatarWrapper>
            {renderTeamMembersAvatars()}
            {renderAdditionalMemberAvatars()}
          </Styled.MemberAvatarWrapper>
        </Styled.ItemContent>
      </Styled.Container>

      {openEditModal && (
        <EditTeamModal
          team={team}
          open
          onClose={() => setOpenEditModal(false)}
          onSaved={(team) => {
            dispatch(actions.updateTeamInList(team));
          }}
          onError={(message) =>
            openModal({
              type: ModalTypes.ERROR,
              title: t('common.failed'),
              confirmButtonTitle: t('common.ok'),
              message,
            })
          }
        />
      )}
      {openTransferModal && (
        <TeamTransferModal
          team={team}
          open={openTransferModal}
          onClose={() => setOpenTransferModal(!openTransferModal)}
          onSaved={() => {
            setOpenTransferModal(!openTransferModal);
            dispatch(actions.removeTeamInList(team._id));
          }}
        />
      )}
    </div>
  );
}

TeamItemGrid.propTypes = {
  currentUser: PropTypes.object,
  navigate: PropTypes.func,
  openModal: PropTypes.func.isRequired,
  team: PropTypes.object,
  currentOrganization: PropTypes.object,
  closeModal: PropTypes.func,
  updateModalProperties: PropTypes.func.isRequired,
};

TeamItemGrid.defaultProps = {
  currentUser: {},
  team: {},
  navigate: () => {},
  currentOrganization: null,
  closeModal: () => {},
};

export default TeamItemGrid;
