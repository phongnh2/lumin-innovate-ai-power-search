import { uniqBy } from 'lodash';
import uniq from 'lodash/uniq';
import { Text, Icomoon as KiwiIcomoon, enqueueSnackbar } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useReducer, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Trans } from 'react-i18next';
import { batch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import AddMessageComponent from 'lumin-components/AddMessage';
import AddShareMemberInput from 'lumin-components/AddShareMemberInput';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import Icomoon from 'lumin-components/Icomoon';
import LinkToShare from 'lumin-components/LinkToShare';
import RequestAccessDocumentList from 'lumin-components/RequestAccessDocumentList';
import RequestAccessSection from 'lumin-components/RequestAccessSection';
import FullRequestList from 'lumin-components/ShareModal/components/FullRequestList';
import ShareModalTitle from 'lumin-components/ShareModal/components/Title';
import styles from 'lumin-components/ShareModal/ShareModal.module.scss';
import * as Styled from 'lumin-components/ShareModal/ShareModal.styled';
import ShareModalRenderer from 'lumin-components/ShareModalRenderer';
import ShareSettingModal from 'lumin-components/ShareSettingModal';

import {
  useBulkSharingPermission,
  useThemeMode,
  useGetTargetRequestAccess,
  useUrlSearchParams,
  useTranslation,
  useGetFolderType,
  useFolderPathMatch,
  useHitDocStackModalForOrgMembers,
  useEnableWebReskin,
} from 'hooks';
import { useIsMountedRef } from 'hooks/useIsMountedRef';

import { organizationServices, documentServices } from 'services';

import { getHitDocStackModalForSharedUser } from 'helpers/getHitDocStackModalForSharedUser';
import getOrgOfDoc from 'helpers/getOrgOfDoc';
import logger from 'helpers/logger';
import mentionsManager from 'helpers/MentionsManager';

import { toastUtils, trackEventUserSharedDocument, logUtils } from 'utils';
import errorExtract from 'utils/error';
import documentPermissionsChecker from 'utils/Factory/DocumentPermissions';
import { getDocumentRoleIndex } from 'utils/permission';

import InviteSharedUsersModal from 'features/CNC/CncComponents/InviteSharedUsersModal';
import { useEnableInviteSharedUserModal } from 'features/CNC/hooks/useEnableInviteSharedUserModal';
import { useEnableDocumentActionPermission } from 'features/DocumentActionPermission';

import { AnimationBanner } from 'constants/banner';
import { BULK_UPDATE_LIST_TITLE, DOCUMENT_TYPE, folderType } from 'constants/documentConstants';
import { ErrorCode } from 'constants/errorCode';
import UserEventConstants from 'constants/eventConstants';
import { DOCUMENT_ROLES, ModalTypes, LOGGER, SearchUserStatus, STATUS_CODE } from 'constants/lumin-common';
import { ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';
import { ORGANIZATION_ROLES, SHARE_DOCUMENT_LIST_TYPE, ORG_TEXT } from 'constants/organizationConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { Colors } from 'constants/styles';
import { TEAMS_TEXT } from 'constants/teamConstant';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import SharingList from './components/SharingList';
import getUpdateState from './helpers/getUpdateState';
import useMembers from './hooks/useMembers';
import { initialState, reducer } from './reducer';
import { socket } from '../../socket';

const BulkUpdateSharePermission = lazy(() => import('lumin-components/BulkUpdateSharePermission'));

const propTypes = {
  onClose: PropTypes.func,
  currentDocument: PropTypes.object,
  organizations: PropTypes.object,
  refetchDocument: PropTypes.func,
  openModal: PropTypes.func,
  updateDocument: PropTypes.func.isRequired,
  isExternalOpened: PropTypes.bool,
  setShowDiscardModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func,
  resetFetchingStateOfDoclist: PropTypes.func,
  isViewer: PropTypes.bool,
  setShouldShowRating: PropTypes.func,
  setDiscardModalType: PropTypes.func,
};

const defaultProps = {
  onClose: () => {},
  currentDocument: {},
  organizations: {},
  refetchDocument: () => {},
  openModal: () => {},
  isExternalOpened: true,
  closeModal: () => {},
  resetFetchingStateOfDoclist: () => {},
  isViewer: false,
  setShouldShowRating: () => {},
  setDiscardModalType: () => {},
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const ShareDocumentOrganizationModal = (props) => {
  const {
    onClose,
    currentDocument,
    organizations,
    refetchDocument,
    openModal,
    isExternalOpened,
    updateDocument,
    setShowDiscardModal,
    closeModal,
    resetFetchingStateOfDoclist,
    isViewer,
    setShouldShowRating,
    setDiscardModalType,
  } = props;
  const isMounted = useIsMountedRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { isEnableReskin } = useEnableWebReskin();
  const [state, dispatch] = useReducer(reducer, { ...initialState, documentRole: currentDocument.roleOfDocument });
  const isInFolderPage = useFolderPathMatch();
  const currentOrgRole = state?.currentUserRole;
  const documentRole = state?.documentRole?.toUpperCase();
  const currentFolderType = useGetFolderType();
  const { _id: documentId, ownerId, documentType, roleOfDocument, belongsTo, capabilities } = currentDocument;
  const searchParams = useUrlSearchParams();
  const requesterId = searchParams.get(UrlSearchParam.REQUESTER_ID);
  const targetRequest = useGetTargetRequestAccess(documentId, requesterId);
  const { canEditDocumentActionPermission, principleList } = capabilities || {};
  const { enabled: isEnableDocumentActionPermission } = useEnableDocumentActionPermission();
  const enableEditDocumentActionPermission = isEnableDocumentActionPermission && canEditDocumentActionPermission;
  const isSharedDocumentTab = currentFolderType === folderType.SHARED;
  const {
    canBulkUpdate,
    list: bulkUpdateList,
    defaultValue,
  } = useBulkSharingPermission({
    currentDocument: {
      ...currentDocument,
      roleOfDocument: documentRole?.toLowerCase(),
    },
    currentOrgRole: currentOrgRole?.toLowerCase(),
  });
  const isManager = organizationServices.isManager(currentOrgRole) || currentOrgRole === ORGANIZATION_ROLES.TEAM_ADMIN;
  const defaultListType =
    state?.isLoading || isManager ? SHARE_DOCUMENT_LIST_TYPE.MEMBER : SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL;
  const allMembers = state.members.concat(uniq(state.invitedByEmailList));
  const hasPermission = DOCUMENT_ROLES.SHARER === roleOfDocument.toUpperCase();
  const { listType, setListType, getMembers } = useMembers({ data: state, defaultType: defaultListType });
  const themeMode = useThemeMode();
  const { t } = useTranslation();
  const orgOfDoc = getOrgOfDoc({ organizations, currentDocument });
  const hitDocStackModalSettings = useHitDocStackModalForOrgMembers({ orgOfDoc });
  const { enabled: enabledInviteSharedUserModal } = useEnableInviteSharedUserModal();

  const permissionChecker = useMemo(() => {
    const checker = documentPermissionsChecker.from(documentType);
    return checker.createChecker({
      document: currentDocument,
      userRole: state.currentUserRole,
    });
  }, [currentDocument, documentType, state.currentUserRole]);

  const canUpdateShareSetting = permissionChecker.canUpdateShareSetting();

  const onReload = async () => {
    setShowDiscardModal(false);
    onClose();
    if (!(isInFolderPage || isViewer)) {
      resetFetchingStateOfDoclist();
    }
    refetchDocument();
  };

  const handleOnClose = () => {
    navigate(location.pathname, { replace: true });
    onClose();
    setShouldShowRating(AnimationBanner.SHOW);
  };

  const openPermissionDeniedModal = () => {
    const modalSettings = {
      type: ModalTypes.ERROR,
      title: t('modalShare.permissionDenied'),
      message: t('modalShare.messagePermissionDenied'),
      confirmButtonTitle: t('common.gotIt'),
      isFullWidthButton: !isEnableReskin,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      useReskinModal: true,
      onConfirm: onReload,
    };
    openModal(modalSettings);
  };

  const openHitDocStackModal = (action = UserEventConstants.Events.HeaderButtonsEvent.SHARE) => {
    if (currentDocument.isShared) {
      openModal(getHitDocStackModalForSharedUser(action, t));
    } else {
      openModal(hitDocStackModalSettings);
    }
  };

  const handleOnClickOrgName = () => {
    const { url, _id } = belongsTo.location;
    if (belongsTo.type === DOCUMENT_TYPE.ORGANIZATION) {
      navigate(`/${ORG_TEXT}/${url}/members`);
    } else {
      navigate(`/${ORG_TEXT}/${url}/${TEAMS_TEXT}/${_id}/members`);
    }
    onClose();
  };

  const mapUserFields = ({ _id, avatarRemoteId, email, name, userId }) => ({
    avatarRemoteId,
    email,
    id: _id || userId,
    name,
  });

  const updateMentionData = ({ members = [], sharees = [] }) => {
    const formattedMembers = members.map(mapUserFields);
    const formattedSharees = sharees.map(mapUserFields);
    if (mentionsManager.isInit) {
      mentionsManager.setUserData(uniqBy(formattedMembers.concat(formattedSharees), (user) => user.id));
    }
  };

  const fetchIndividualList = async () => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: { isLoading: true } });
      dispatch({ type: 'START_FETCH_REQUEST_ACCESS_LIST' });
      const {
        internalShareList: { sharees },
        requestAccessList: { requesters, total: totalRequest, cursor, hasNextPage },
      } = await documentServices.getIndividualShareesDocument({
        documentId: currentDocument._id,
        requestAccessInput: {
          documentId: currentDocument._id,
          cursor: '',
        },
      });
      if (!isMounted.current) {
        return;
      }
      updateMentionData({ sharees: sharees.filter(({ _id }) => _id !== currentDocument.ownerId) });
      batch(() => {
        dispatch({
          type: 'UPDATE_INVITED_BY_EMAIL_LIST',
          payload: { invitedByEmailList: sharees },
        });
        dispatch({
          type: 'UPDATE_REQUEST_ACCESS_LIST',
          payload: { requestAccessList: { requesters, totalRequest, cursor, hasNextPage } },
        });
      });
    } catch (e) {
      openPermissionDeniedModal();
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: { isLoading: false } });
    }
  };

  const fetchFullList = async () => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: { isLoading: true } });
      dispatch({ type: 'START_FETCH_REQUEST_ACCESS_LIST' });
      const {
        internalMemberPayload: {
          members,
          total: totalMember,
          currentRole: currentUserRole,
          cursor,
          hasNextPage,
          organizationName,
          teamName,
        },
        internalShareList: { sharees },
        requestAccessList: {
          requesters,
          total: totalRequest,
          cursor: requestAccessCursor,
          hasNextPage: hasNextPageRequest,
        },
      } = await documentServices.getFullShareesDocument({
        internalMemberInput: {
          documentId,
          cursor: '',
          minQuantity: 30,
        },
        requestAccessInput: {
          documentId,
          cursor: '',
        },
      });
      if (isMounted.current) {
        updateMentionData({ members, sharees });
        batch(() => {
          const name = documentType === DOCUMENT_TYPE.ORGANIZATION ? organizationName : teamName;
          dispatch({ type: 'SET_NAME', payload: { name } });
          dispatch({
            type: 'UPDATE_MEMBERS_LIST_INFO',
            payload: {
              members,
              totalMember,
              currentUserRole,
              cursor,
              hasNextPage,
            },
          });
          dispatch({
            type: 'UPDATE_INVITED_BY_EMAIL_LIST',
            payload: { invitedByEmailList: sharees },
          });
          dispatch({
            type: 'UPDATE_REQUEST_ACCESS_LIST',
            payload: {
              requestAccessList: {
                requesters,
                totalRequest,
                cursor: requestAccessCursor,
                hasNextPage: hasNextPageRequest,
              },
            },
          });
        });
      }
    } catch (e) {
      openPermissionDeniedModal();
    } finally {
      if (isMounted.current) {
        dispatch({ type: 'SET_IS_LOADING', payload: { isLoading: false } });
      }
    }
  };

  const fetchData = () => {
    if (isExternalOpened) {
      fetchIndividualList();
    } else {
      fetchFullList();
    }
  };

  const fetchMoreRequestAccess = async () => {
    const { cursor, requesters, loading, isFetchingMore } = state.requestAccessList;
    if (!requesters.length || loading || isFetchingMore) {
      return;
    }
    dispatch({
      type: 'UPDATE_REQUEST_ACCESS_LIST',
      payload: {
        requestAccessList: {
          ...state.requestAccessList,
          isFetchingMore: true,
        },
      },
    });
    const requestAccessData = await documentServices.getRequestAccessDocsList({
      documentId: currentDocument._id,
      cursor,
    });
    dispatch({
      type: 'UPDATE_REQUEST_ACCESS_LIST',
      payload: {
        requestAccessList: {
          requesters: requesters.concat(requestAccessData.requesters),
          totalRequest: requestAccessData.total,
          cursor: requestAccessData.cursor,
          hasNextPage: requestAccessData.hasNextPage,
          isFetchingMore: false,
        },
      },
    });
  };

  const loadMoreOrgMember = async () => {
    try {
      dispatch({ type: 'SET_IS_FETCHING', payload: { isFetchingData: true } });
      const data = await organizationServices.getMembersByDocumentId({
        documentId,
        cursor: state.fetchingMemberCursor,
        minQuantity: 30,
      });
      if (isMounted.current) {
        dispatch({
          type: 'UPDATE_MEMBERS_LIST_INFO',
          payload: {
            members: [...state.members, ...data.members],
            totalMember: data.total,
            currentUserRole: data.currentRole,
            cursor: data.cursor,
            hasNextPage: data.hasNextPage,
          },
        });
        const name = documentType === DOCUMENT_TYPE.ORGANIZATION ? data.organizationName : data.teamName;
        dispatch({ type: 'SET_NAME', payload: { name } });
      }
    } finally {
      if (isMounted.current) {
        dispatch({
          type: 'SET_IS_FETCHING',
          payload: { isFetchingData: false },
        });
      }
    }
  };

  const handleChangeUserTagPermission = (permission) =>
    dispatch({
      type: 'UPDATE_USER_TAG_PERMISSION',
      payload: { userTagPermission: permission },
    });

  const setUserTag = (userTags, callback = () => {}) => {
    dispatch({ type: 'UPDATE_USER_TAGS', payload: { userTags } });
    callback();
  };

  const setPendingUserTag = (pendingUserTags, callback = () => {}) => {
    dispatch({
      type: 'UPDATE_PENDING_USER_TAGS',
      payload: { pendingUserTags },
    });
    callback();
  };

  const handleRemoveUserTag = (userTags) => {
    dispatch({ type: 'UPDATE_USER_TAGS', payload: { userTags } });
  };

  const handleSetShowShareMessage = (data) =>
    dispatch({
      type: 'UPDATE_SHOW_SHARE_MESSAGE',
      payload: { showMessage: data },
    });

  const handleSetShareMessage = (shareMessage) => dispatch({ type: 'UPDATE_SHARE_MESSAGE', payload: { shareMessage } });

  const handleSetLimitedShareError = (limitedShareError) =>
    dispatch({
      type: 'SET_LIMITED_SHARE_ERROR',
      payload: { limitedShareError },
    });

  const handleSetLoading = (loading) => dispatch({ type: 'LOADING_ADD_MEMBER', payload: { loading } });

  const handleResetShareModalList = () => dispatch({ type: 'RESET_SHARE_MODAL_LIST' });

  const handleShareDocumentError = (error) => {
    const { message, statusCode, code } = errorExtract.extractGqlError(error);
    if (code === ErrorCode.Common.RESTRICTED_ACTION) {
      toastUtils.error({ message: ERROR_MESSAGE_RESTRICTED_ACTION });
      return;
    }
    if (statusCode === STATUS_CODE.FORBIDDEN) {
      openPermissionDeniedModal();
    }
    if (statusCode === STATUS_CODE.NOT_ACCEPTABLE) {
      openHitDocStackModal();
    } else {
      handleSetLimitedShareError(message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setShowDiscardModal(Boolean(state.userTags.length));
  }, [setShowDiscardModal, state.userTags.length]);

  const updateRequestAccesses = (selected, typeList, popperValue) => {
    const requestUser = state.requestAccessList.requesters.find((requester) =>
      typeList === SHARE_DOCUMENT_LIST_TYPE.MEMBER
        ? requester._id === selected.userId
        : requester.email === selected.email
    );
    const shouldRemoveRequest =
      popperValue === 'REMOVE' ||
      (requestUser?.role && getDocumentRoleIndex(popperValue) <= getDocumentRoleIndex(requestUser.role.toUpperCase()));
    if (requestUser && shouldRemoveRequest) {
      dispatch({
        type: 'UPDATE_REQUEST_ACCESS_LIST',
        payload: {
          requestAccessList: {
            ...state.requestAccessList,
            requesters: state.requestAccessList.requesters.filter((requester) => requester._id !== requestUser._id),
            totalRequest: state.requestAccessList.totalRequest - 1,
          },
        },
      });
    }
  };

  const updateMembersList = (typePopper, typeList, payload) => {
    const membersData = typeList === SHARE_DOCUMENT_LIST_TYPE.MEMBER ? state.members : state.invitedByEmailList;
    const updateState = getUpdateState(typeList, state);

    if (typeList !== SHARE_DOCUMENT_LIST_TYPE.MEMBER) {
      if (typePopper === 'UPDATE') {
        const { member } = payload;
        dispatch({
          type: updateState.type,
          payload: {
            [updateState.stateName]: [...updateState.state, { ...member }],
          },
        });
        return;
      }
      if (typePopper === 'REMOVE') {
        dispatch({
          type: updateState.type,
          payload: {
            [updateState.stateName]: updateState.state.filter((member) => member.email !== payload.email),
          },
        });
        if (mentionsManager.isInit) {
          mentionsManager.setUserData(mentionsManager.getUserData().filter((share) => share.email !== payload.email));
        }
        updateRequestAccesses(payload, typeList, typePopper);
        return;
      }
      const memberList = updateState.state;
      const updatedInvitedByEmailList = memberList.map((member) =>
        member.email === payload.email ? { ...member, role: typePopper } : member
      );
      dispatch({
        type: updateState.type,
        payload: { [updateState.stateName]: updatedInvitedByEmailList },
      });
      updateRequestAccesses(payload, typeList, typePopper);
      return;
    }
    const updatedMemberList = membersData.map((member) =>
      member.userId === payload.userId ? { ...member, permission: typePopper } : member
    );
    dispatch({
      type: updateState.type,
      payload: { [updateState.stateName]: updatedMemberList },
    });
    updateRequestAccesses(payload, typeList, typePopper);
  };

  const filterExternalUser = (user) =>
    (!user.grantedPermission && user.status === SearchUserStatus.USER_VALID) || !user._id;

  const handleConfirmShareModal = (openInviteSharedUser) => {
    const { userTags } = state;
    if (!userTags.length) {
      onClose();
      return;
    }
    const validExternalUsers = userTags.filter(filterExternalUser);
    if (documentType === DOCUMENT_TYPE.ORGANIZATION && validExternalUsers.length) {
      const isInOrganization = documentType === DOCUMENT_TYPE.ORGANIZATION;
      const modalType = isInOrganization ? t('organization', { ns: 'terms' }) : t('team', { ns: 'terms' });
      const title =
        validExternalUsers.length > 1 ? (
          <Trans
            i18nKey="modalShare.titleMultipleExternalUser"
            values={{
              email: validExternalUsers[0].email,
              name: state.name,
              modalType,
              totalRemainingExternalUsers: validExternalUsers.length - 1,
            }}
          />
        ) : (
          <Trans
            i18nKey="modalShare.titleOnlyOneExternalUser"
            values={{ email: validExternalUsers[0].email, name: state.name, modalType }}
          />
        );
      const message = t('modalShare.messageWarningShareModal', { modalType });
      const modalSettings = {
        type: ModalTypes.WARNING,
        title,
        message,
        confirmButtonTitle: t('modalShare.shareAnyway'),
        className: 'ShareDocumentOrganizationModal__warningModalWrapper',
        onConfirm: () => {
          closeModal();
          // eslint-disable-next-line no-use-before-define
          handleSharingLuminUser(openInviteSharedUser, isInOrganization);
        },
        useReskinModal: true,
      };
      openModal(modalSettings);
    } else {
      // eslint-disable-next-line no-use-before-define
      handleSharingLuminUser();
    }
  };

  const getEmailField = (target) => target.email;

  const getSharedUsers = () => state.userTags.map(getEmailField);

  const getUsersInvitableToOrg = async () => {
    try {
      const invitableEmails = await organizationServices.getUsersInvitableToOrg({
        orgId: orgOfDoc._id,
        userEmails: getSharedUsers(),
      });
      const sharedUserEmailsNotInOrgSet = new Set(invitableEmails);
      return state.userTags.filter(({ email }) => sharedUserEmailsNotInOrgSet.has(email));
    } catch (error) {
      logger.logError({ error });
      return [];
    }
  };

  const handleSharingLuminUser = async (openInviteSharedUser = () => {}, isInOrganization = false) => {
    handleSetLoading(true);
    const { userTags, userTagPermission, shareMessage } = state;
    const sharedUsers = getSharedUsers();
    logUtils.logShareDocument(userTags, LOGGER.EVENT.FILE_SHARED_ORGANIZATION);
    let shouldOpenInviteSharedUserModal = false;
    try {
      if (sharedUsers.length) {
        const [_, invitableUser] = await Promise.all([
          documentServices.shareDocumentByEmail({
            emails: sharedUsers,
            message: shareMessage,
            documentId,
            role: userTagPermission.toUpperCase(),
          }),
          enabledInviteSharedUserModal && isInOrganization && orgOfDoc?._id ? getUsersInvitableToOrg() : [],
        ]);

        shouldOpenInviteSharedUserModal = !!invitableUser.length;
        if (shouldOpenInviteSharedUserModal) {
          setUserTag(invitableUser);
        }

        if (userTags.length > 0) {
          enqueueSnackbar({
            message: t('modalShare.sharedWithRecipient', { numberNewUsersShared: userTags.length }),
            variant: 'success',
          });
        }
      }
      trackEventUserSharedDocument(
        userTags,
        currentDocument?.shareSetting?.linkType,
        userTagPermission,
        currentDocument?._id
      );
      fetchData();
      setListType(SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL);
      if (shouldOpenInviteSharedUserModal) {
        openInviteSharedUser();
      } else if (isEnableReskin) {
        setShowDiscardModal(false);
        onClose();
      }
    } catch (error) {
      handleShareDocumentError(error);
    } finally {
      if (!shouldOpenInviteSharedUserModal) {
        handleResetShareModalList();
      }

      handleSetLoading(false);
    }
  };

  const onAfterBulkUpdate = useCallback(
    async ({ permission, selectedList }) => {
      selectedList.forEach((selectedValue) => {
        switch (selectedValue) {
          case BULK_UPDATE_LIST_TITLE.INVITED_LIST: {
            const newInvitedList = state.invitedByEmailList.map((item) => ({
              ...item,
              role: permission,
            }));
            dispatch({
              type: 'UPDATE_INVITED_BY_EMAIL_LIST',
              payload: { invitedByEmailList: newInvitedList },
            });
            state.invitedByEmailList.forEach((member) => {
              socket.emit(SOCKET_EMIT.SHARE_PERMISSION, {
                type: 'UPDATE',
                documentId: currentDocument._id,
                role: permission.toUpperCase(),
                id: member._id,
              });
            });
            break;
          }
          case BULK_UPDATE_LIST_TITLE.MEMBER_LIST: {
            // Only update members which are not manager
            const updateMembers = state.members.map((member) => {
              const isAdmin =
                organizationServices.isManager(member.role) || member.role === ORGANIZATION_ROLES.TEAM_ADMIN;
              const isDocOwner = ownerId === member.userId;
              return isAdmin || isDocOwner ? member : { ...member, permission: permission.toUpperCase() };
            });
            dispatch({
              type: 'UPDATE_MEMBERS_LIST_INFO',
              payload: {
                members: updateMembers,
                totalMember: state.totalMember,
                currentUserRole: state.currentUserRole,
                documentRole: state.documentRole,
                cursor: state.cursor,
                hasNextPage: state.hasNextPage,
              },
            });
            break;
          }
          default:
            break;
        }
      });
      const requestAccessData = await documentServices.getRequestAccessDocsList({
        documentId: currentDocument._id,
        cursor: '',
      });
      dispatch({
        type: 'UPDATE_REQUEST_ACCESS_LIST',
        payload: {
          requestAccessList: {
            requesters: requestAccessData.requesters,
            totalRequest: requestAccessData.total,
            cursor: requestAccessData.cursor,
            hasNextPage: requestAccessData.hasNextPage,
          },
        },
      });
    },
    [state, dispatch, currentDocument._id]
  );

  const renderShareSettings = useCallback(
    ({ onClose: onCloseShareSettings }) => (
      <ShareSettingModal
        currentDocument={currentDocument}
        shareSetting={currentDocument.shareSetting}
        handleClose={onCloseShareSettings}
        refetchDocument={refetchDocument}
        updateDocument={updateDocument}
        openHitDocStackModal={openHitDocStackModal}
      />
    ),
    [currentDocument]
  );

  const renderBulkUpdate = useCallback(
    ({ onClose: onCloseBulkUpdate }) => (
      <Suspense fallback={<div>loading...</div>}>
        {canBulkUpdate && (
          <BulkUpdateSharePermission
            canBulkUpdate={canBulkUpdate}
            description={t('modalShare.exceptAdministratorsAnyoneWhoAreIn')}
            bulkUpdateList={bulkUpdateList}
            defaultValue={defaultValue}
            onCancel={onCloseBulkUpdate}
            onCompleted={onAfterBulkUpdate}
            documentId={currentDocument._id}
            openModal={openModal}
            openPermissionDeniedModal={openPermissionDeniedModal}
            principleList={principleList}
            enableEditDocumentActionPermission={enableEditDocumentActionPermission}
            currentDocument={currentDocument}
            updateDocument={updateDocument}
          />
        )}
      </Suspense>
    ),
    [currentDocument._id, bulkUpdateList, defaultValue, canBulkUpdate, onAfterBulkUpdate, principleList]
  );

  const renderRequestAccessContent = useCallback(
    (_props) => (
      <RequestAccessDocumentList.Organization
        currentDocument={currentDocument}
        targetRequest={targetRequest}
        requestedList={state.requestAccessList.requesters.filter((requester) => targetRequest?._id !== requester._id)}
        reloadRequestList={fetchData}
        currentUserRole={state.currentUserRole}
        total={state.requestAccessList.totalRequest}
        fetchMore={fetchMoreRequestAccess}
        hasNextPage={state.requestAccessList.hasNextPage}
        isFetching={state.isFetchingData}
        openHitDocStackModal={openHitDocStackModal}
        {..._props}
      />
    ),
    [currentDocument, state.currentUserRole, state.requestAccessList.requesters, targetRequest]
  );

  const renderFullRequestAccess = useCallback(
    ({ onClose: onCloseFullRequestAccess }) => (
      <FullRequestList
        titleComponent={
          <ShareModalTitle
            bottomGap={false}
            hasPermission={hasPermission}
            onBack={onCloseFullRequestAccess}
            showBackButton
            title={t('modalShare.requestsOnThisDocument')}
            backTooltip={t('modalShare.backToShareModal')}
            enableEditDocumentActionPermission={enableEditDocumentActionPermission}
          />
        }
      >
        {renderRequestAccessContent({ fullList: true })}
      </FullRequestList>
    ),
    [hasPermission, renderRequestAccessContent]
  );

  const isDisabledButton = state.loading;

  const renderSharingList = useCallback(
    (openShareSetting) => (
      <SharingList
        ownerId={ownerId}
        onLoadMore={loadMoreOrgMember}
        hasNextPage={state.hasNextPageMember}
        currentDocument={currentDocument}
        handleClickSharingSettings={openShareSetting}
        shouldShowSharingSettings={canUpdateShareSetting}
        updateMembersList={updateMembersList}
        currentUserRole={state.currentUserRole}
        isFetching={state.isFetchingData}
        loading={state.isLoading}
        listType={listType}
        setListType={setListType}
        members={getMembers()}
        documentRole={roleOfDocument}
        themeMode={themeMode}
        openModal={openModal}
        openPermissionDeniedModal={openPermissionDeniedModal}
      />
    ),
    [canUpdateShareSetting, currentDocument, listType, openModal, ownerId, roleOfDocument, state, themeMode]
  );

  const renderAddShareMemberInput = useCallback(
    (shouldAutoFoucusOnInput) => (
      <AddShareMemberInput
        members={allMembers}
        userTags={state.userTags}
        setShareMessage={handleSetShowShareMessage}
        handleAddUserTag={setUserTag}
        handleAddPendingUserTag={setPendingUserTag}
        handleChangeUserTagPermission={handleChangeUserTagPermission}
        pendingUserList={state.pendingUserTags}
        documentId={documentId}
        searchType={documentType}
        handleSetMessage={handleSetLimitedShareError}
        handleRemoveUserTag={handleRemoveUserTag}
        themeMode={themeMode}
        shareMessage={state.showMessage}
        isReskin={isEnableReskin}
        autoFocus={shouldAutoFoucusOnInput}
      />
    ),
    [allMembers, documentId, documentType, state, themeMode, isEnableReskin]
  );

  const renderMessageAddMember = useCallback(
    ({ isReskin, openInviteSharedUser }) => (
      <>
        <AddMessageComponent
          shareMessage={state.shareMessage}
          setShareMessage={handleSetShareMessage}
          classNames="ShareDocumentOrganizationModal__addMessage"
        />
        <Styled.FooterButtonContainer
          disabledCancel={state.loading}
          onCancel={onClose}
          label={isReskin ? t('common.share') : t('common.save')}
          loading={state.loading}
          disabled={isDisabledButton}
          onSubmit={() => handleConfirmShareModal(openInviteSharedUser)}
          isReskin={isReskin}
        />
      </>
    ),
    [isDisabledButton, onClose, state]
  );

  const renderInviteSharedUser = useCallback(() => {
    if (!orgOfDoc?._id) {
      return null;
    }

    return (
      <InviteSharedUsersModal
        organization={orgOfDoc}
        userTags={state.userTags}
        pendingUserList={state.pendingUserTags}
        onClose={onClose}
        setShowDiscardModal={setShowDiscardModal}
        handleResetShareModalList={handleResetShareModalList}
      />
    );
  }, [orgOfDoc, state.userTags, state.pendingUserTags]);

  if (isEnableReskin) {
    return (
      <ShareModalRenderer
        renderShareSetting={renderShareSettings}
        renderBulkUpdate={renderBulkUpdate}
        renderFullRequestAccess={renderFullRequestAccess}
        renderInviteSharedUser={renderInviteSharedUser}
        setDiscardModalType={setDiscardModalType}
      >
        {({ openShareSetting, openBulkUpdate, openFullRequestList, openInviteSharedUser, shouldAutoFoucusOnInput }) => (
          <>
            <Styled.TopBlockContainerReskin shadow="lg" radius="lg">
              <ShareModalTitle
                hasPermission={hasPermission}
                onBack={() => handleSetShowShareMessage(false)}
                showBackButton={state.showMessage}
                documentName={currentDocument.name}
                openBulkUpdate={openBulkUpdate}
                enableEditDocumentActionPermission={enableEditDocumentActionPermission}
                canBulkUpdate={canBulkUpdate}
              />
              <RequestAccessSection total={state.requestAccessList.totalRequest} openFullList={openFullRequestList}>
                {renderRequestAccessContent}
              </RequestAccessSection>
              <div style={{ height: 'var(--kiwi-spacing-2)' }} />
              {hasPermission && renderAddShareMemberInput(shouldAutoFoucusOnInput)}
              {state.showMessage ? (
                renderMessageAddMember({ isReskin: true, openInviteSharedUser })
              ) : (
                <>
                  {!isManager && !state.isLoading && !isSharedDocumentTab && !isExternalOpened && (
                    <div className={styles.memberSection}>
                      <KiwiIcomoon type="users-md" size="md" color="var(--kiwi-colors-surface-on-surface-variant)" />
                      <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)" component="div">
                        <Trans
                          i18nKey="modalShare.everyoneCanAccessThisFile"
                          values={{ locationName: belongsTo.location.name }}
                          components={{
                            b: <b role="presentation" onClick={handleOnClickOrgName} style={{ fontWeight: 700 }} />,
                          }}
                        />
                      </Text>
                    </div>
                  )}
                  {renderSharingList(openShareSetting)}
                </>
              )}
            </Styled.TopBlockContainerReskin>
            {!state.showMessage && (
              <Styled.BottomBlockContainerReskin shadow="lg" radius="lg">
                <LinkToShare
                  currentDocument={currentDocument}
                  handleClickSharingSettings={openShareSetting}
                  canUpdateShareSettings={canUpdateShareSetting}
                />
              </Styled.BottomBlockContainerReskin>
            )}
          </>
        )}
      </ShareModalRenderer>
    );
  }

  return (
    <ShareModalRenderer
      renderShareSetting={renderShareSettings}
      renderBulkUpdate={renderBulkUpdate}
      renderFullRequestAccess={renderFullRequestAccess}
      renderInviteSharedUser={renderInviteSharedUser}
      setDiscardModalType={setDiscardModalType}
    >
      {({ openShareSetting, openBulkUpdate, openFullRequestList, openInviteSharedUser, shouldAutoFoucusOnInput }) => (
        <>
          <Styled.TopBlockContainer>
            <ShareModalTitle
              hasPermission={hasPermission}
              onBack={() => handleSetShowShareMessage(false)}
              showBackButton={state.showMessage}
              documentName={currentDocument.name}
              enableEditDocumentActionPermission={enableEditDocumentActionPermission}
            />
            <RequestAccessSection total={state.requestAccessList.totalRequest} openFullList={openFullRequestList}>
              {renderRequestAccessContent}
            </RequestAccessSection>
            {hasPermission && renderAddShareMemberInput(shouldAutoFoucusOnInput)}
            {state.showMessage ? (
              renderMessageAddMember({ isReskin: false, openInviteSharedUser })
            ) : (
              <>
                {!isManager && !state.isLoading && !isSharedDocumentTab && !isExternalOpened && (
                  <Styled.MemberSection>
                    <Icomoon className="location-team" size={18} color={Colors.NEUTRAL_60} />
                    <Styled.MemberSectionText>
                      <Trans
                        i18nKey="modalShare.everyoneCanAccessThisFile"
                        values={{ locationName: belongsTo.location.name }}
                        components={{ b: <Styled.MemberSectionOrg onClick={handleOnClickOrgName} /> }}
                      />
                    </Styled.MemberSectionText>
                  </Styled.MemberSection>
                )}
                {renderSharingList(openShareSetting)}
                <Styled.TopBlockFooter $useGrid={canBulkUpdate}>
                  {canBulkUpdate && (
                    <ButtonMaterial color={ButtonColor.TERTIARY} onClick={openBulkUpdate}>
                      {t('modalShare.bulkUpdatePermissions')}
                    </ButtonMaterial>
                  )}
                  <Styled.DoneButton onClick={handleOnClose}>{t('common.done')}</Styled.DoneButton>
                </Styled.TopBlockFooter>
              </>
            )}
          </Styled.TopBlockContainer>
          {!state.showMessage && (
            <Styled.BottomBlockContainer>
              <LinkToShare
                currentDocument={currentDocument}
                handleClickSharingSettings={openShareSetting}
                canUpdateShareSettings={canUpdateShareSetting}
              />
            </Styled.BottomBlockContainer>
          )}
        </>
      )}
    </ShareModalRenderer>
  );
};

ShareDocumentOrganizationModal.propTypes = propTypes;
ShareDocumentOrganizationModal.defaultProps = defaultProps;

export default ShareDocumentOrganizationModal;
