/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable import/order */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { unstable_batchedUpdates } from 'react-dom';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import { findIndex, find } from 'lodash';

import { googleServices, uploadServices, documentServices, userServices, organizationServices } from 'services';
import deepCopy from 'helpers/deepCopy';
import mentionsManager from 'helpers/MentionsManager';
import { DocumentStorage, documentStorage, UserSharingType } from 'constants/documentConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { ModalTypes, LOGGER, DOCUMENT_ROLES, STATUS_CODE, DOCUMENT_LINK_TYPE } from 'constants/lumin-common';
import { getDocumentRoleIndex } from 'utils/permission';
import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import UserEventConstants from 'constants/eventConstants';
import { Plans } from 'constants/plan';
import { TRANSFER_FILE_SIZE_LIMIT } from 'constants/fileSize';
import { UPDATE_SHARE_DOCUMENT_PERMISSION, REMOVE_SHARE_DOCUMENT_PERMISSION } from 'graphQL/DocumentGraph';
import {
  getFileService,
  toastUtils,
  validator,
  trackEventUserSharedDocument,
  logUtils,
  file,
  eventTracking,
} from 'utils';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';
import errorExtract from 'utils/error';
import CookieWarningContext from 'luminComponents/CookieWarningModal/Context';
import { getHitDocStackModalForSharedUser } from 'helpers/getHitDocStackModalForSharedUser';
import logger from 'helpers/logger';
import { useRestrictedUser, useStrictDownloadGooglePerms, useTransferFile } from 'hooks';
import { socket } from '../../socket';
import ShareModal from './ShareModal';
import { ShareModalContext } from './ShareModalContext';
import { ErrorCode, GoogleErrorCode } from 'constants/errorCode';
import { ERROR_MESSAGE_RESTRICTED_ACTION, ERROR_MESSAGE_TYPE } from 'constants/messages';
import { featureStoragePolicy } from 'features/FeatureConfigs';

import useRestrictedFileSizeModal from 'hooks/useRestrictedFileSizeModal';

const initialRequestAccessList = {
  requesters: [],
  total: 0,
  cursor: '',
  hasNextPage: true,
  loading: false,
  isFetchingMore: false,
};

const propTypes = {
  t: PropTypes.func,
  currentDocument: PropTypes.object,
  organizations: PropTypes.object,
  currentUser: PropTypes.object,
  client: PropTypes.object,
  onClose: PropTypes.func,
  openModal: PropTypes.func,
  open: PropTypes.bool,
  openShareSettingModal: PropTypes.func,
  cookiesDisabled: PropTypes.bool.isRequired,
  setCookieModalVisible: PropTypes.func.isRequired,
  refetchDocument: PropTypes.func,
  updateDocument: PropTypes.func.isRequired,
  setShowDiscardModal: PropTypes.func.isRequired,
  isInFolderPage: PropTypes.bool,
  resetFetchingStateOfDoclist: PropTypes.func,
  isViewer: PropTypes.bool,
  hitDocStackModalSettings: PropTypes.object,
  handleConfirmTransferFile: PropTypes.func,
  isDriveOnlyUser: PropTypes.bool,
  openStrictModal: PropTypes.func,
  orgOfDoc: PropTypes.object,
  enabledInviteSharedUserModal: PropTypes.bool,
  setDiscardModalType: PropTypes.func,
  isEnableShareDocFeedback: PropTypes.bool,
  setShowFeedbackModal: PropTypes.func,
  openShareModal: PropTypes.bool,
  openRestrictedFileSizeModal: PropTypes.func,
};

const defaultProps = {
  t: () => {},
  currentDocument: {},
  organizations: {},
  currentUser: {},
  client: {},
  onClose: () => {},
  openModal: () => {},
  openShareSettingModal: () => {},
  open: false,
  refetchDocument: () => {},
  isInFolderPage: false,
  resetFetchingStateOfDoclist: () => {},
  isViewer: false,
  hitDocStackModalSettings: {},
  handleConfirmTransferFile: () => {},
  isDriveOnlyUser: false,
  openStrictModal: () => {},
  orgOfDoc: {},
  enabledInviteSharedUserModal: false,
  setDiscardModalType: () => {},
  isEnableShareDocFeedback: false,
  setShowFeedbackModal: () => {},
  openShareModal: true,
  openRestrictedFileSizeModal: () => {},
};

const _handleShowErrorToast = (error) => {
  toastUtils.openToastMulti({
    type: ModalTypes.ERROR,
    error,
    useReskinToast: true,
  });
};

const getEmailField = (target) => target.email;

class ShareModalContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      requestAccessList: initialRequestAccessList,
      message: '',
      userTags: [],
      isShareLinkOpen: false,
      isTransfering: false,
      shareMessage: false,
      userTagPermission: DOCUMENT_ROLES.SPECTATOR,
      isInLuminStorage: false,
      pendingUserList: [],
      shareErrorMessage: '',
    };
    this.oldMembers = [];
  }

  componentDidMount() {
    this._getSharees();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutDisplayToast);
  }

  _check3rdCookies = (callback = () => {}) => {
    const { isDriveOnlyUser } = this.props;
    if (isDriveOnlyUser) {
      this.resetTagsState();
      toastUtils.error({ message: ERROR_MESSAGE_RESTRICTED_ACTION, useReskinToast: true });
      return;
    }
    const { cookiesDisabled, setCookieModalVisible, currentDocument } = this.props;
    if (cookiesDisabled && featureStoragePolicy.externalStorages.includes(currentDocument.service)) {
      setCookieModalVisible(true);
      return;
    }
    callback();
  };

  _getSharees = async (isAddedNewMember = false, addedEmail = []) => {
    const { currentDocument } = this.props;
    const { userTagPermission } = this.state;

    this.setState((prevState) => ({
      requestAccessList: {
        ...prevState.requestAccessList,
        loading: true,
        hasNextPage: true,
        cursor: '',
      },
    }));
    try {
      const {
        internalShareList: { sharees },
        requestAccessList,
      } = await documentServices.getIndividualShareesDocument({
        documentId: currentDocument._id,
        requestAccessInput: {
          documentId: currentDocument._id,
          cursor: '',
        },
      });
      this.setState(
        {
          members: sharees,
          requestAccessList: {
            ...requestAccessList,
            loading: false,
          },
        },
        () => {
          if (!this.oldMembers.length) {
            this.oldMembers = this.state.members;
          }
        }
      );
      if (mentionsManager.isInit) {
        mentionsManager.setUserData(
          sharees.map(({ _id, avatarRemoteId, email, name }) => ({ avatarRemoteId, email, id: _id, name }))
        );
      }
      if (isAddedNewMember) {
        const totalSharedList = sharees.filter((sharees) => sharees.role !== 'owner').length;
        socket.emit(SOCKET_EMIT.SHARE_PERMISSION, {
          type: 'ADD',
          documentId: currentDocument._id,
          role: userTagPermission.toUpperCase(),
          emails: addedEmail,
          totalSharedList,
        });
      }
    } catch (error) {
      const { statusCode, code } = errorExtract.extractGqlError(error);
      if (code === ErrorCode.Common.RESTRICTED_ACTION) {
        toastUtils.error({ message: ERROR_MESSAGE_RESTRICTED_ACTION });
        return;
      }
      if (statusCode === STATUS_CODE.FORBIDDEN) {
        this._openPermissionDeniedModal();
      }
      logger.logError({ error });
    }
  };

  _fetchMoreRequestAccess = async () => {
    const { currentDocument } = this.props;
    const { requestAccessList } = this.state;
    const { cursor } = requestAccessList;
    if (!requestAccessList.requesters.length || requestAccessList.loading || requestAccessList.isFetchingMore) {
      return;
    }
    this.setState((prevState) => ({
      requestAccessList: { ...prevState.requestAccessList, isFetchingMore: true },
    }));
    const requestAccessData = await documentServices.getRequestAccessDocsList({
      documentId: currentDocument._id,
      cursor,
    });
    this.setState((prevState) => ({
      requestAccessList: {
        requesters: prevState.requestAccessList.requesters.concat(requestAccessData.requesters),
        total: requestAccessData.total,
        cursor: requestAccessData.cursor,
        hasNextPage: requestAccessData.hasNextPage,
        isFetchingMore: false,
      },
    }));
  };

  _openPermissionDeniedModal = async () => {
    const { t } = this.props;
    const modalSettings = {
      type: ModalTypes.ERROR,
      title: t('modalShare.permissionDenied'),
      message: t('modalShare.messagePermissionDenied'),
      confirmButtonTitle: t('common.gotIt'),
      isFullWidthButton: false,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      onConfirm: this.onReload,
      useReskinModal: true,
    };
    this.props.openModal(modalSettings);
  };

  _openHitDocStackModal = (action = UserEventConstants.Events.HeaderButtonsEvent.SHARE) => {
    const { currentDocument, hitDocStackModalSettings, t } = this.props;
    const { isShared } = currentDocument;
    if (isShared) {
      this.props.openModal(getHitDocStackModalForSharedUser(action, t));
    } else {
      this.props.openModal(hitDocStackModalSettings);
    }
  };

  onReload = async () => {
    const { onClose, resetFetchingStateOfDoclist, refetchDocument, isInFolderPage, isViewer } = this.props;
    onClose();
    if (!isInFolderPage || isViewer) {
      resetFetchingStateOfDoclist();
    }
    refetchDocument();
  };

  _handleChangePermission = async (member, role) => {
    const { members, requestAccessList } = this.state;
    const { t, currentDocument } = this.props;
    const cloneMembers = deepCopy(members);
    const memberIndex = findIndex(members, ['_id', member._id]);
    cloneMembers[memberIndex].role = role;
    const foundRequest = requestAccessList.requesters.find((requester) => requester._id === member._id);
    try {
      const {
        data: { updateDocumentPermission },
      } = await this.props.client.mutate({
        mutation: UPDATE_SHARE_DOCUMENT_PERMISSION,
        variables: {
          input: {
            documentId: currentDocument._id,
            role: role.toUpperCase(),
            email: member.email,
          },
        },
      });
      if (updateDocumentPermission) {
        this.setState({
          members: cloneMembers,
        });
        socket.emit(SOCKET_EMIT.SHARE_PERMISSION, {
          type: 'UPDATE',
          documentId: currentDocument._id,
          role: role.toUpperCase(),
          id: member._id,
        });
        toastUtils.openToastMulti({
          type: ModalTypes.SUCCESS,
          message: t('modalShare.updateSuccessfully'),
          useReskinToast: true,
        });
        const shouldRemoveRequest =
          foundRequest?.role &&
          getDocumentRoleIndex(role.toUpperCase()) <= getDocumentRoleIndex(foundRequest.role.toUpperCase());
        if (foundRequest && shouldRemoveRequest) {
          this.setState({
            requestAccessList: {
              ...requestAccessList,
              requesters: requestAccessList.requesters.filter((requester) => requester._id !== foundRequest._id),
              total: requestAccessList.total - 1,
            },
          });
        }
      }
    } catch (error) {
      const { code } = errorExtract.extractGqlError(error);
      if (code === ErrorCode.Common.RESTRICTED_ACTION) {
        toastUtils.error({ message: ERROR_MESSAGE_RESTRICTED_ACTION });
        return;
      }
      this._openPermissionDeniedModal();
    }
  };

  _handleRemoveMember = async (infoMember) => {
    const { currentDocument } = this.props;
    try {
      const {
        data: { removeDocumentPermission },
      } = await this.props.client.mutate({
        mutation: REMOVE_SHARE_DOCUMENT_PERMISSION,
        variables: {
          input: {
            documentId: currentDocument._id,
            email: infoMember?.email,
          },
        },
      });
      if (removeDocumentPermission) {
        logger.logInfo({
          message: LOGGER.EVENT.REMOVE_DOCUMENT_PERMISSION,
          reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
        });

        const totalSharedList = this.state.members.filter(
          (member) => member._id !== infoMember?._id && member.role !== 'owner'
        ).length;

        socket.emit(SOCKET_EMIT.SHARE_PERMISSION, {
          type: 'DELETE',
          documentId: currentDocument._id,
          linkType: currentDocument.shareSetting.linkType,
          id: infoMember?._id,
          totalSharedList,
        });
        // For mentions in viewer
        if (mentionsManager.isInit) {
          mentionsManager.setUserData(mentionsManager.getUserData()?.filter((share) => share?.id !== infoMember?._id));
        }
      }
      unstable_batchedUpdates(() => {
        this.setState((prevState) => {
          const { requesters: prevRequesters, total: prevTotal } = prevState.requestAccessList;
          const updatedList = prevRequesters.filter((requester) => requester._id !== infoMember._id);
          const total = prevTotal - (prevRequesters.length - updatedList.length);
          return {
            requestAccessList: {
              ...prevState.requestAccessList,
              requesters: updatedList,
              total,
            },
          };
        });
        this.setState((state) => ({
          members: state.members.filter((member) => member._id !== infoMember?._id),
        }));
      });
    } catch (error) {
      _handleShowErrorToast(error);
    }
  };

  _handleDoneClick = async () => {
    const { t, handleConfirmTransferFile, currentDocument } = this.props;

    if (this.state.isShareLinkOpen) {
      this.setState({ isTransfering: true }, () => {
        if (!this._isLuminStorageDocument()) {
          handleConfirmTransferFile({ currentDocument, setState: (state) => this.setState(state) }).finally(() => {
            this.setState({ isTransfering: false });
          });
        } else {
          const newPermissions = this.state.members.filter((member) =>
            this.oldMembers.every((oldMember) => oldMember._id !== member._id)
          );
          const numberNewUsersShared = newPermissions.length;
          this.timeoutDisplayToast = setTimeout(() => {
            this.props.onClose();
            if (numberNewUsersShared >= 1) {
              toastUtils.openToastMulti({
                type: ModalTypes.SUCCESS,
                message: t('modalShare.sharedWithRecipient', { numberNewUsersShared }),
                useReskinToast: true,
              });
            }
          }, 1000);
          this.setState({ isTransfering: false, message: '' });
        }
      });
    } else {
      this.props.onClose();
    }
  };

  _handleTransferFile = async (files) => {
    const { t } = this.props;

    try {
      if (!files.length) {
        return;
      }
      await this._sendRequestUploadFile(files[0]);
    } catch (error) {
      let modalSetting;
      if (error.message === 'fileSize') {
        modalSetting = {
          type: ModalTypes.ERROR,
          title: t('modalShare.errorFileSize.title'),
          message: t('modalShare.errorFileSize.message', { size: file.getFileSizeLimit(TRANSFER_FILE_SIZE_LIMIT) }),
        };
      } else {
        modalSetting = {
          type: ModalTypes.ERROR,
          title: 'Error',
          message: t('modalShare.uploadFileErrorMessage'),
        };
      }
      this.props.openModal(modalSetting);
    }
  };

  _sendRequestUploadFile = async (file) => {
    const { currentDocument, t, updateDocument } = this.props;
    const { workspaceId } = currentDocument.belongsTo;
    try {
      const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({ file });
      const uploader = new PersonalDocumentUploadService();
      const uploadedDocument = await uploader.upload({
        encodedUploadData,
        fileName: file.name,
        documentId: currentDocument._id,
        orgId: workspaceId,
      });
      updateDocument(uploadedDocument);
      if (currentDocument.service === documentStorage.google) {
        eventTracking(UserEventConstants.EventType.CONVERT_FILE_TO_LUMIN, {
          LuminFileId: uploadedDocument._id,
          originalStorage: DocumentStorage.GOOGLE,
          action: 'share',
        });
      }
      socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, {
        roomId: this.props.currentDocument._id,
        type: 'updateService',
        previousDocumentData: {
          service: currentDocument.service,
          remoteId: currentDocument.remoteId,
        },
      });
    } catch (error) {
      const { code } = errorExtract.extractGqlError(error);
      if (code === ErrorCode.Common.RESTRICTED_ACTION) {
        return;
      }
      const modalSettings = {
        type: ModalTypes.ERROR,
        title: t('modalShare.documentUploadFailed'),
        message: t('modalShare.uploadDocumentAgain'),
        useReskinModal: true,
        confirmButtonProps: {
          withExpandedSpace: true,
        },
      };
      this.props.openModal(modalSettings);
    }
  };

  checkGooglePermission = async () => {
    const { currentDocument } = this.props;
    if (currentDocument.service === documentStorage.google) {
      const currentRemoteEmail = await googleServices.getCurrentRemoteEmail();
      return currentDocument.remoteEmail === currentRemoteEmail;
    }
    return false;
  };

  // eslint-disable-next-line class-methods-use-this
  signinGoogleForTransferFile = () =>
    new Promise((resolve) => {
      googleServices.implicitSignIn({
        callback: () => {
          resolve(true);
          logger.logInfo({
            message: 'Sign in Google for transfer file',
          });
        },
        onError: (error) => {
          resolve(false);
          logger.logError({
            reason: LOGGER.Service.GOOGLE_API_ERROR,
            error,
          });
        },
      });
    });

  hasAnyPremium = ({ currentOrganization }) => {
    const { currentUser } = this.props;

    if (currentOrganization) {
      return validator.validatePremiumOrganization(currentOrganization);
    }

    return currentUser.payment.type !== Plans.FREE;
  };

  _handleShareDocNotStoreInLumin = async () => {
    const { organizations, currentDocument, openRestrictedFileSizeModal } = this.props;
    const {
      belongsTo: { workspaceId },
    } = currentDocument;
    const orgList = organizations.data.map(({ organization }) => organization);
    const currentOrganization = find(orgList, { _id: workspaceId });
    const fileSize = currentDocument.size;
    const { allowedUpload, maxSizeAllow } = uploadServices.checkUploadBySize(
      fileSize,
      this.hasAnyPremium({ currentOrganization })
    );

    try {
      const { isAllowed } = await documentServices.checkShareThirdPartyDocument({ documentId: currentDocument._id });

      if (!allowedUpload) {
        this.resetState();
        openRestrictedFileSizeModal({ organization: currentOrganization, maxSizeAllow });
      } else if (!isAllowed) {
        this.resetState();
        this._openHitDocStackModal();
        return false;
      }

      return { allowedUpload: allowedUpload && isAllowed };
    } catch (error) {
      this.resetState();
      return false;
    }
  };

  _handleChangeShareMessage = (text) => {
    this.setState({
      message: text,
    });
  };

  _handleAddUserTag = (newTags, callback) => {
    this.setState({ userTags: newTags }, callback);
  };

  _handleAddPendingUserTag = (newTags, callback) => {
    this.setState({ pendingUserList: newTags }, callback);
  };

  _handleChangeUserTagPermission = (permission) => {
    this.setState({ userTagPermission: permission });
  };

  handleShareLimitErrorMessage = (errorMessage) => {
    this.setState({ shareErrorMessage: errorMessage });
  };

  _handleRemoveUserTag = (newTags) => {
    this.setState({ userTags: newTags });
  };

  _handleShareDocumentError = (error) => {
    const { message, statusCode, code } = errorExtract.extractGqlError(error);
    if (code === ErrorCode.Common.RESTRICTED_ACTION) {
      toastUtils.error({ message: ERROR_MESSAGE_RESTRICTED_ACTION });
      return;
    }
    if (statusCode === STATUS_CODE.FORBIDDEN) {
      this._openPermissionDeniedModal();
    }
    if (statusCode === STATUS_CODE.NOT_ACCEPTABLE) {
      this._openHitDocStackModal();
    } else {
      this.handleShareLimitErrorMessage(message);
    }
  };

  resetState = () => {
    this.setState({
      isShareLinkOpen: false,
      isInLuminStorage: false,
      isTransfering: false,
      message: '',
    });
  };

  _handleAllTransferFile = async () => {
    const { currentDocument, t, isViewer, refetchDocument, openStrictModal } = this.props;
    if (!this._isLuminStorageDocument()) {
      if (currentDocument.service === documentStorage.google) {
        if (!googleServices.isSignedIn()) {
          const signIn = await this.signinGoogleForTransferFile();
          if (!signIn) {
            this.setState({ isShareLinkOpen: false, isTransfering: false });
            return false;
          }
        }
        const isValidGooglePermission = await this.checkGooglePermission();
        if (!isValidGooglePermission) {
          const currentRemoteEmail = await googleServices.getCurrentRemoteEmail();
          const modalSetting = {
            type: ModalTypes.ERROR,
            title: t('modalShare.canShareFile'),
            message: t('modalShare.messageLogginIncorectAccount', {
              docName: currentDocument.name,
              currentDocumentRemoteEmail: currentDocument.remoteEmail,
              remoteEmail: currentRemoteEmail,
            }),
            onCancel: () => this.setState({ isTransfering: false }),
            confirmButtonTitle: t('modalShare.reSignIn'),
            onConfirm: async () => {
              logger.logInfo({
                message: LOGGER.EVENT.IS_VALID_GOOGLE_PERMISSION,
                reason: LOGGER.Service.GOOGLE_API_INFO,
              });
              googleServices.removeImplicitAccessToken();
              googleServices.implicitSignIn({
                withDrivePermission: true,
                onError: (error) => {
                  logger.logError({
                    reason: LOGGER.Service.GOOGLE_API_ERROR,
                    error,
                  });
                },
              });
              this.props.onClose();
            },
          };
          this.props.openModal(modalSetting);
          return false;
        }
      }
      const { allowedUpload } = await this._handleShareDocNotStoreInLumin();
      if (!allowedUpload) {
        return false;
      }
      try {
        const file = await getFileService.getDocument(currentDocument);
        if (!file) {
          this.resetState();
          return false;
        }

        const { linearizedFile } = await uploadServices.linearPdfFromFiles(file);

        await this._handleTransferFile([linearizedFile]);

        if (isViewer) {
          refetchDocument();
        }
      } catch (error) {
        if (error?.message === ERROR_MESSAGE_TYPE.PDF_CANCEL_PASSWORD) {
          toastUtils.error({ message: error.message, useReskinToast: true });
          return false;
        }
        const { errors } = error.result?.error || {};
        if (errors[0].reason === GoogleErrorCode.CANNOT_DOWNLOAD_FILE) {
          openStrictModal(this._handleSendClick, () => {});
        }
        return false;
      } finally {
        this.resetState();
      }
      this.setState({
        isInLuminStorage: true,
      });
    }
    return true;
  };

  _handleSendClick = async (openInviteSharedUser = () => {}) => {
    const { userTags } = this.state;
    const { setShowDiscardModal, onClose } = this.props;
    logUtils.logShareDocument(userTags, LOGGER.EVENT.FILE_SHARED_PERSONAL);
    this.setState({ isTransfering: true });
    const isTransferFileSuccess = await this._handleAllTransferFile();
    if (!isTransferFileSuccess) {
      return;
    }

    const { shouldOpenInviteSharedUser } = await this.handleSendMailAndCheckInvitableUser(openInviteSharedUser);
    this.setState({
      isTransfering: false,
      message: '',
    });
    userServices.saveHubspotProperties({
      key: HUBSPOT_CONTACT_PROPERTIES.SHARE_DOCUMENT,
      value: 'true',
    });

    if (!shouldOpenInviteSharedUser) {
      setShowDiscardModal(false);
      onClose();
    }
  };

  handleSendMailAndCheckInvitableUser = async (openInviteSharedUser = () => {}) => {
    const { enabledInviteSharedUserModal, orgOfDoc } = this.props;
    const [shareDocumentError, invitableUsers] = await Promise.all([
      this._handleSendSharingEmail(),
      enabledInviteSharedUserModal && orgOfDoc._id ? this.getUsersInvitableToOrg() : [],
    ]);

    const shouldOpenInviteSharedUser =
      enabledInviteSharedUserModal && Boolean(invitableUsers.length) && !shareDocumentError;
    if (shouldOpenInviteSharedUser) {
      this.setState({ userTags: invitableUsers, isTransfering: false });
      openInviteSharedUser();
    } else {
      this.resetState();
      this.resetTagsState();
    }

    return { shouldOpenInviteSharedUser };
  };

  _sendSharingInvitation = () => {
    const { message, userTagPermission } = this.state;
    const { currentDocument } = this.props;
    this.setState({ isTransfering: true });
    const sharedEmails = this.getSharedEmails();
    return documentServices.shareDocumentByEmail({
      emails: sharedEmails,
      message,
      documentId: currentDocument._id,
      role: userTagPermission.toUpperCase(),
    });
  };

  getSharedEmails = () => {
    const { userTags } = this.state;
    return userTags.map(getEmailField);
  };

  getUsersInvitableToOrg = async () => {
    try {
      const { orgOfDoc } = this.props;
      const { userTags } = this.state;
      const invitableEmails = await organizationServices.getUsersInvitableToOrg({
        orgId: orgOfDoc._id,
        userEmails: this.getSharedEmails(),
      });
      const sharedUserEmailsNotInOrgSet = new Set(invitableEmails);
      return userTags.filter(({ email }) => sharedUserEmailsNotInOrgSet.has(email));
    } catch (error) {
      logger.logError({ error });
      return [];
    }
  };

  _handleSendSharingEmail = async () => {
    const { enabledInviteSharedUserModal } = this.props;
    const { userTagPermission, userTags } = this.state;
    const { t, currentDocument } = this.props;
    const sharedEmails = this.getSharedEmails();
    let shareDocumentError = false;
    try {
      if (sharedEmails.length) {
        await this._sendSharingInvitation()
          .then(({ data: { shareDocument } }) => {
            if (shareDocument) {
              this._getSharees(true, sharedEmails);
              if (!enabledInviteSharedUserModal) {
                this.setState({
                  shareMessage: false,
                });
              }
              toastUtils.openToastMulti({
                type: ModalTypes.SUCCESS,
                message: t('modalShare.sharedWithUsers', { numberEmailShared: sharedEmails.length }),
                useReskinToast: true,
              });
            }
          })
          .catch((error) => {
            shareDocumentError = true;
            this._handleShareDocumentError(error);
          })
          .finally(() => {
            if (!enabledInviteSharedUserModal) {
              this.setState({ isTransfering: false });
            }
          });
      }
      trackEventUserSharedDocument(
        userTags,
        currentDocument?.shareSetting?.linkType,
        userTagPermission,
        currentDocument?._id
      );
    } catch (error) {
      shareDocumentError = true;
      const { code } = errorExtract.extractGqlError(error);
      if (code === ErrorCode.Common.RESTRICTED_ACTION) {
        toastUtils.error({ message: ERROR_MESSAGE_RESTRICTED_ACTION });
      }
      logger.logError({ error });
    } finally {
      if (!enabledInviteSharedUserModal) {
        this.resetTagsState();
      }
    }
    return shareDocumentError;
  };

  openShareLink = async () => {
    this.setState(
      ({ isShareLinkOpen }) => ({
        isShareLinkOpen: !isShareLinkOpen,
      }),
      async () => {
        await this._handleDoneClick();
      }
    );
  };

  resetTagsState = () => {
    this.setState({
      userTags: [],
      pendingUserList: [],
      shareMessage: false,
    });
  };

  _isLuminStorageDocument = () => this.props.currentDocument.service === 's3' || this.state.isInLuminStorage;

  hasPermission = () => {
    const { currentDocument } = this.props;
    return [DOCUMENT_ROLES.OWNER, DOCUMENT_ROLES.SHARER].includes(currentDocument.roleOfDocument);
  };

  hasSlackPermission = () => {
    const { currentDocument } = this.props;
    return DOCUMENT_ROLES.OWNER === currentDocument.roleOfDocument;
  };

  setShareMessage = (state) => {
    this.setState({ shareMessage: state });
  };

  changeState = (state) => this.setState(state);

  _handleTransferFileByCheckLuminStorage = async (afterTransferCallback = async () => {}) => {
    const { currentDocument } = this.props;

    if (!this._isLuminStorageDocument()) {
      this.setState({
        isTransfering: true,
      });
      await this.props.handleConfirmTransferFile({
        afterTransferCallback,
        setState: this.changeState,
        currentDocument,
      });
    } else {
      await afterTransferCallback();
    }
  };

  closeShareModal = () => {
    const { onClose } = this.props;
    const { isTransfering } = this.state;
    if (isTransfering) {
      return;
    }
    const { currentDocument, isEnableShareDocFeedback, setShowFeedbackModal } = this.props;
    if (!isEnableShareDocFeedback) {
      onClose();
      return;
    }
    const { members } = this.state;
    const hasShared = members.filter((member) => member.role.toUpperCase() !== DOCUMENT_ROLES.OWNER).length > 0;
    if (currentDocument.shareSetting.linkType === DOCUMENT_LINK_TYPE.INVITED && !hasShared) {
      setShowFeedbackModal(true);
      onClose();
      return;
    }
    onClose();
  };

  onAfterBulkUpdate = async ({ permission }) => {
    const { currentDocument, currentUser } = this.props;
    const { members } = this.state;
    const filterMember = (item) => item._id !== currentUser._id && item.type === UserSharingType.EXTERNAL;
    this.setState((prev) => ({
      members: prev.members.map((item) => (filterMember(item) ? { ...item, role: permission } : item)),
      requestAccessList: {
        ...prev.requestAccessList,
        loading: true,
      },
    }));
    const requestAccessData = await documentServices.getRequestAccessDocsList({
      documentId: currentDocument._id,
      cursor: '',
    });
    this.setState({
      requestAccessList: {
        requesters: requestAccessData.requesters,
        total: requestAccessData.total,
        cursor: requestAccessData.cursor,
        hasNextPage: requestAccessData.hasNextPage,
        loading: false,
      },
    });
    // public socket to update members
    members.filter(filterMember).forEach((member) => {
      socket.emit(SOCKET_EMIT.SHARE_PERMISSION, {
        type: 'UPDATE',
        documentId: currentDocument._id,
        role: permission.toUpperCase(),
        id: member._id,
      });
    });
  };

  render() {
    const {
      open,
      currentDocument,
      openShareSettingModal,
      updateDocument,
      orgOfDoc,
      setShowDiscardModal,
      setDiscardModalType,
      openShareModal,
    } = this.props;
    const {
      members,
      isTransfering,
      message,
      shareMessage,
      userTags,
      pendingUserList,
      shareErrorMessage,
      isShareLinkOpen,
      requestAccessList,
    } = this.state;
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const context = {
      members,
      handleChangePermission: this._handleChangePermission,
      handleRemoveMember: this._handleRemoveMember,
      handleTransferFileByCheckLuminStorage: this._handleTransferFileByCheckLuminStorage,
      getSharees: this._getSharees,
      isTransfering,
      currentDocument,
      isLuminStorageDocument: this._isLuminStorageDocument(),
      openShareSettingModal,
      userRole: currentDocument.roleOfDocument,
      hasPermission: this.hasPermission(),
      hasSlackPermission: this.hasSlackPermission(),
      closeShareModal: this.closeShareModal,
      shareMessage,
      message,
      open,
      shareErrorMessage,
      setShareMessage: this.setShareMessage,
      handleAddUserTag: this._handleAddUserTag,
      handleAddPendingUserTag: this._handleAddPendingUserTag,
      handleChangeUserTagPermission: this._handleChangeUserTagPermission,
      pendingUserList,
      handleError: this.handleShareLimitErrorMessage,
      handleRemoveUserTag: this._handleRemoveUserTag,
      userTags,
      handleChangeShareMessage: this._handleChangeShareMessage,
      handleDoneClick: this._handleDoneClick,
      check3rdCookies: this._check3rdCookies,
      handleSendClick: this._handleSendClick,
      updateDocument,
      openShareLink: this.openShareLink,
      onAfterBulkUpdate: this.onAfterBulkUpdate,
      isShareLinkOpen,
      requestAccessList,
      fetchMoreRequestAccess: this._fetchMoreRequestAccess,
      openHitDocStackModal: this._openHitDocStackModal,
      setDiscardModalType,
      handleAllTransferFile: this._handleAllTransferFile,
      openShareModal,
    };
    if (!currentDocument) {
      return null;
    }

    return (
      <ShareModalContext.Provider value={context}>
        <ShareModal
          orgOfDoc={orgOfDoc}
          setShowDiscardModal={setShowDiscardModal}
          resetTagsState={this.resetTagsState}
        />
      </ShareModalContext.Provider>
    );
  }
}

ShareModalContainer.propTypes = propTypes;
ShareModalContainer.defaultProps = defaultProps;

function ShareModalWrapper(props) {
  const { refetchDocument, updateDocument } = props;
  const { cookiesDisabled, setCookieModalVisible } = useContext(CookieWarningContext);

  const { showModal: openStrictModal } = useStrictDownloadGooglePerms();

  const { handleConfirmTransferFile } = useTransferFile({ refetchDocument, updateDocument });
  const { isDriveOnlyUser } = useRestrictedUser();
  const { openRestrictedFileSizeModal } = useRestrictedFileSizeModal();

  return (
    <ShareModalContainer
      {...props}
      cookiesDisabled={cookiesDisabled}
      setCookieModalVisible={setCookieModalVisible}
      handleConfirmTransferFile={handleConfirmTransferFile}
      isDriveOnlyUser={isDriveOnlyUser}
      openStrictModal={openStrictModal}
      openRestrictedFileSizeModal={openRestrictedFileSizeModal}
    />
  );
}

ShareModalWrapper.propTypes = propTypes;
ShareModalWrapper.defaultProps = defaultProps;

export default compose(withTranslation())(ShareModalWrapper);
