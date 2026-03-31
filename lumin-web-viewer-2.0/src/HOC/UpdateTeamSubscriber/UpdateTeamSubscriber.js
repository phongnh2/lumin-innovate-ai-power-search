import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { matchPath, useParams } from 'react-router-dom';
import { compose } from 'redux';

import { socket } from 'src/socket';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import { useGetFolderType, useTranslation } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { ModalTypes } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { Routers, ROUTE_MATCH } from 'constants/Routers';
import { SOCKET_ON } from 'constants/socketConstant';
import { SOCKET_TYPE, TEAMS_TEXT } from 'constants/teamConstant';

import './UpdateTeamSubscriber.scss';

const propTypes = {
  navigate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  openModal: PropTypes.func,
  currentUser: PropTypes.object,
  currentOrganization: PropTypes.object,
  removeTeamById: PropTypes.func,
  removeAllDocumentsByTeamId: PropTypes.func,
};

const defaultProps = {
  openModal: () => {},
  currentUser: {},
  currentOrganization: {},
  removeTeamById: () => {},
  removeAllDocumentsByTeamId: () => {},
};

function UpdateTeamSubscriber(props) {
  const {
    openModal,
    navigate,
    currentUser,
    currentOrganization,
    removeTeamById,
    removeAllDocumentsByTeamId,
    location,
    children,
  } = props;
  const { teamId: currentTeamId } = useParams();
  const currentFolderType = useGetFolderType();
  const isInDocument = Boolean(
    matchPath(
      {
        path: ROUTE_MATCH.ORG_DOCUMENT,
        end: false,
      },
      location.pathname
    )
  );
  const { url: organizationUrl } = currentOrganization?.data || {};
  const { t } = useTranslation();

  const isCurrentUser = (userId) => currentUser._id === userId;
  const isCurrentTeam = (teamId) => teamId === currentTeamId;

  useEffect(() => {
    socket.on(SOCKET_ON.UPDATE_TEAM, (data) => {
      const { type, teamId } = data;
      const teamPermissionRemovalType = [SOCKET_TYPE.REMOVE_MEMBER, SOCKET_TYPE.LEAVE_TEAM, SOCKET_TYPE.DELETE_TEAM];
      if (isInDocument && teamPermissionRemovalType.includes(type)) {
        removeAllDocumentsByTeamId(teamId);
      }

      if ([SOCKET_TYPE.REMOVE_MEMBER, SOCKET_TYPE.DELETE_TEAM].includes(type)) {
        // eslint-disable-next-line no-use-before-define
        const modalData = modalMaps(data);
        modalData && openModal(modalData);
      }
    });

    return () => {
      socket.removeListener({ message: SOCKET_ON.UPDATE_TEAM });
    };
  }, [currentFolderType, currentTeamId]);

  const getUpdatePermissionDataModal = () => ({
    type: ModalTypes.WARNING,
    title: t('orgPage.yourPermissionUpdated'),
    message: t('orgPage.reloadToHaveNewPermission'),
    isFullWidthButton: true,
    confirmButtonTitle: t('common.reload'),
    className: 'UpdateTeam__custom',
    onConfirm: () => window.location.reload(),
    disableBackdropClick: true,
    disableEscapeKeyDown: true,
  });

  const getMessageModal = (type, teamName) => {
    if (type === SOCKET_TYPE.DELETE_TEAM) {
      return <Trans i18nKey="orgPage.teamWasDeleted" values={{ teamName }} components={{ b: <b /> }} />;
    }

    return <Trans i18nKey="orgPage.removedFromTeam" values={{ teamName }} components={{ b: <b /> }} />;
  };

  const getAccessExpiredDataModalByType = (data) => {
    const { teamName, teamId, type } = data;
    const url = isInDocument ? Routers.DOCUMENTS : `/${TEAMS_TEXT}`;

    return {
      title: t('orgPage.permissionIsExpired'),
      message: getMessageModal(type, teamName),
      type: ModalTypes.WARNING,
      isFullWidthButton: true,
      confirmButtonTitle: t('common.ok'),
      onConfirm: () => {
        removeTeamById(teamId);
        const navigateTo = organizationUrl ? `/${ORG_TEXT}/${organizationUrl}${url}` : url;
        navigate(navigateTo);
      },
      className: 'UpdateTeam__custom',
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
    };
  };

  const getDocTeamWarningModalSettings = (data) => {
    const { teamId } = data;
    const shouldRenderModal = currentFolderType === folderType.TEAMS && isCurrentTeam(teamId);
    return shouldRenderModal && getAccessExpiredDataModalByType(data);
  };

  const getDeleteTeamDataSettings = (data) => {
    const { teamId, actorId } = data;
    if (!isCurrentTeam(teamId)) {
      return null;
    }
    if (isCurrentUser(actorId)) {
      return getUpdatePermissionDataModal();
    }
    return getAccessExpiredDataModalByType(data);
  };

  const getRemoveMemberDataSettings = (data) => {
    const { userId, teamId } = data;
    if (!isCurrentUser(userId) && !isCurrentTeam(teamId)) {
      return null;
    }
    return getAccessExpiredDataModalByType(data);
  };

  const getLeaveTeamDataSettings = (data) => {
    const { teamId, userId } = data;
    if (!isCurrentUser(userId) || !isCurrentTeam(teamId)) {
      return null;
    }
    return getUpdatePermissionDataModal();
  };

  const modalMaps = (data) => {
    if (isInDocument) {
      return getDocTeamWarningModalSettings(data);
    }
    switch (data.type) {
      case SOCKET_TYPE.REMOVE_MEMBER:
        return getRemoveMemberDataSettings(data);
      case SOCKET_TYPE.LEAVE_TEAM:
        return getLeaveTeamDataSettings(data);
      case SOCKET_TYPE.DELETE_TEAM:
        return getDeleteTeamDataSettings(data);
      default:
        return null;
    }
  };

  return useMemo(() => children, [children]);
}

UpdateTeamSubscriber.propTypes = propTypes;
UpdateTeamSubscriber.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state),
});
const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
  removeTeamById: (teamId) => dispatch(actions.removeTeamById(teamId)),
  removeAllDocumentsByTeamId: (teamId, shouldRefetch) =>
    dispatch(actions.removeAllDocumentsByTeamId(teamId, shouldRefetch)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter, React.memo)(UpdateTeamSubscriber);
