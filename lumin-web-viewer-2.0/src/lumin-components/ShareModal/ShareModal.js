import { makeStyles } from '@mui/styles';
import { capitalize } from 'lodash';
import { Dialog, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext, useCallback, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import AddMessageComponent from 'lumin-components/AddMessage';
import AddShareMemberInput from 'lumin-components/AddShareMemberInput';
import BulkUpdateSharePermission from 'lumin-components/BulkUpdateSharePermission';
import ButtonMaterial, { ButtonColor } from 'lumin-components/ButtonMaterial';
import RequestAccessDocumentList from 'lumin-components/RequestAccessDocumentList';
import RequestAccessSection from 'lumin-components/RequestAccessSection';
import ShareModalRenderer from 'lumin-components/ShareModalRenderer';
import ShareSettingModal from 'lumin-components/ShareSettingModal';
import { LazyContentDialog } from 'luminComponents/Dialog';
import ModalSkeleton from 'luminComponents/ModalFolder/components/ModalSkeleton';

import {
  useBulkSharingPermission,
  useThemeMode,
  useGetTargetRequestAccess,
  useUrlSearchParams,
  useTranslation,
  useEnableWebReskin,
} from 'hooks';

import fileUtils from 'utils/file';

import InviteSharedUsersModal from 'features/CNC/CncComponents/InviteSharedUsersModal';
import { useEnableDocumentActionPermission } from 'features/DocumentActionPermission';
import { ShareInSlackModal } from 'features/ShareInSlack';
import { shareInSlackSelectors } from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

import { ModalSize } from 'constants/styles';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import Footer from './components/Footer';
import FullRequestList from './components/FullRequestList';
import MemberList from './components/MemberList';
import ShareLinkSection from './components/ShareLinkSection';
import Title from './components/Title';
import { ShareModalContext } from './ShareModalContext';

import * as Styled from './ShareModal.styled';

import styles from './ShareModal.module.scss';

const useStyles = makeStyles({
  paper: {
    background: 'none',
    padding: 0,
    boxShadow: 'none',
    overflow: 'visible',
  },
});

const ShareModal = ({ orgOfDoc, setShowDiscardModal, resetTagsState }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnableReskin } = useEnableWebReskin();
  const {
    hasPermission,
    hasSlackPermission,
    closeShareModal,
    shareMessage,
    handleChangeShareMessage,
    message,
    members,
    userTags,
    setShareMessage,
    handleAddUserTag,
    pendingUserList,
    handleAddPendingUserTag,
    handleChangeUserTagPermission,
    currentDocument,
    handleError,
    handleRemoveUserTag,
    refetchDocument,
    updateDocument,
    isLuminStorageDocument,
    isShareLinkOpen,
    handleDoneClick,
    isTransfering,
    onAfterBulkUpdate,
    userRole,
    handleTransferFileByCheckLuminStorage,
    getSharees,
    requestAccessList,
    fetchMoreRequestAccess,
    openHitDocStackModal,
    setDiscardModalType,
    openShareModal,
  } = useContext(ShareModalContext);
  const { canBulkUpdate, list: bulkUpdateList, defaultValue } = useBulkSharingPermission({ currentDocument });
  const customClasses = useStyles();
  const themeMode = useThemeMode();
  const searchParams = useUrlSearchParams();
  const { capabilities } = currentDocument;
  const { principleList, canEditDocumentActionPermission } = capabilities || {};
  const { enabled: isEnableDocumentActionPermission } = useEnableDocumentActionPermission();
  const enableEditDocumentActionPermission = isEnableDocumentActionPermission && canEditDocumentActionPermission;
  const requesterId = searchParams.get(UrlSearchParam.REQUESTER_ID);
  const targetRequest = useGetTargetRequestAccess(currentDocument._id, requesterId);
  const { total: totalRequest, requesters, hasNextPage, loading: requestAccessLoading } = requestAccessList;
  const requestedList = requesters.filter((member) => member._id !== targetRequest?._id);
  const selectedDestination = useSelector(shareInSlackSelectors.getSelectedDestination);
  const sharedDocumentInfo = useSelector(shareInSlackSelectors.getSharedDocumentInfo);
  const isSharingInSlack = useSelector(shareInSlackSelectors.getIsSharing);

  const onClose = useCallback(() => {
    if (isSharingInSlack) {
      return;
    }
    closeShareModal();
  }, [isSharingInSlack]);

  const renderRequestAccessContent = useCallback(
    (_props) => (
      <RequestAccessDocumentList.Personal
        targetRequest={targetRequest}
        document={currentDocument}
        requestedList={requestedList}
        currentUserRole={userRole}
        handleTransferFileByCheckLuminStorage={handleTransferFileByCheckLuminStorage}
        isTransfering={isTransfering}
        reloadRequestList={getSharees}
        total={totalRequest}
        fetchMore={fetchMoreRequestAccess}
        hasNextPage={hasNextPage}
        isFetching={requestAccessLoading}
        openHitDocStackModal={openHitDocStackModal}
        {..._props}
      />
    ),
    [currentDocument._id, isTransfering, requestedList, targetRequest, totalRequest, userRole]
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
      <BulkUpdateSharePermission
        canBulkUpdate={canBulkUpdate}
        description={t('modalShare.anyoneWhoAreIn')}
        bulkUpdateList={bulkUpdateList}
        defaultValue={defaultValue}
        onCancel={onCloseBulkUpdate}
        documentId={currentDocument._id}
        onCompleted={onAfterBulkUpdate}
        principleList={principleList}
        enableEditDocumentActionPermission={enableEditDocumentActionPermission}
        currentDocument={currentDocument}
        updateDocument={updateDocument}
      />
    ),
    [currentDocument._id, bulkUpdateList, defaultValue, onAfterBulkUpdate, canBulkUpdate, principleList]
  );

  const renderFullRequestAccess = useCallback(
    ({ onClose }) => (
      <FullRequestList
        titleComponent={
          <Title
            hasPermission={hasPermission}
            onBack={onClose}
            showBackButton
            title={t('modalShare.requestsOnThisDocument')}
            backTooltip={t('modalShare.backToShareModal')}
            backClassName={styles.backButtonInFullRequestList}
            enableEditDocumentActionPermission={enableEditDocumentActionPermission}
          />
        }
      >
        {renderRequestAccessContent({ fullList: true })}
      </FullRequestList>
    ),
    [hasPermission, renderRequestAccessContent]
  );

  const renderInviteSharedUser = useCallback(() => {
    if (!orgOfDoc._id) {
      return null;
    }

    return (
      <InviteSharedUsersModal
        organization={orgOfDoc}
        userTags={userTags}
        pendingUserList={pendingUserList}
        onClose={onClose}
        setShowDiscardModal={setShowDiscardModal}
        handleResetShareModalList={resetTagsState}
      />
    );
  }, [orgOfDoc, pendingUserList, userTags, onClose, setShowDiscardModal, resetTagsState]);

  const renderShareInSlack = useCallback(
    ({ onClose }) => (
      <ShareInSlackModal
        onClose={(event) => {
          const isBackBtn = Boolean(event?.target);
          onClose();
          if (!isBackBtn) {
            setShowDiscardModal(false);
            closeShareModal();
          }
        }}
      />
    ),
    []
  );

  const handleOnClose = () => {
    // To DO
    navigate('', { replace: true });
    handleDoneClick();
  };

  useEffect(() => {
    setShowDiscardModal(Boolean(userTags.length || selectedDestination));
  }, [userTags, setShowDiscardModal, selectedDestination]);

  useEffect(() => {
    if (!sharedDocumentInfo) {
      return;
    }
    const { documentId } = sharedDocumentInfo || {};
    if (documentId === currentDocument._id) {
      getSharees();
    }
  }, [sharedDocumentInfo?.documentId, currentDocument._id]);

  if (!openShareModal) {
    return null;
  }

  if (isEnableReskin) {
    return (
      <Dialog
        opened
        onClose={onClose}
        centered
        size="md"
        backgroundColor="none"
        shadow="none"
        padding="none"
        style={{ color: 'var(--kiwi-colors-surface-on-surface)' }}
      >
        <ShareModalRenderer
          renderShareSetting={renderShareSettings}
          renderBulkUpdate={renderBulkUpdate}
          renderFullRequestAccess={renderFullRequestAccess}
          renderInviteSharedUser={renderInviteSharedUser}
          renderShareInSlack={renderShareInSlack}
          setDiscardModalType={setDiscardModalType}
        >
          {({
            openShareSetting,
            openBulkUpdate,
            openFullRequestList,
            openInviteSharedUser,
            openShareInSlack,
            shouldAutoFoucusOnInput,
          }) => (
            <>
              <Styled.TopBlockContainerReskin shadow="lg" radius="lg">
                <Title
                  hasPermission={hasPermission}
                  onBack={() => setShareMessage(false)}
                  showBackButton={shareMessage}
                  documentName={currentDocument.name}
                  openShareInSlack={openShareInSlack}
                  hasSlackPermission={hasSlackPermission}
                  openBulkUpdate={openBulkUpdate}
                  enableEditDocumentActionPermission={enableEditDocumentActionPermission}
                  canBulkUpdate={canBulkUpdate}
                />
                {!isLuminStorageDocument && (
                  <Text
                    type="body"
                    size="md"
                    color="var(--kiwi-colors-surface-on-surface-variant)"
                    className={styles.subTitle}
                  >
                    <Trans
                      i18nKey="modalShare.willStoredAtLumin"
                      components={{ b: <b /> }}
                      values={{ name: fileUtils.getShortFilename(currentDocument.name) }}
                    />
                  </Text>
                )}

                <RequestAccessSection total={totalRequest} openFullList={openFullRequestList}>
                  {renderRequestAccessContent}
                </RequestAccessSection>
                <div style={{ marginTop: 'var(--kiwi-spacing-2)' }} />
                {hasPermission && (
                  <AddShareMemberInput
                    members={members}
                    userTags={userTags}
                    setShareMessage={setShareMessage}
                    handleAddUserTag={handleAddUserTag}
                    handleAddPendingUserTag={handleAddPendingUserTag}
                    handleChangeUserTagPermission={handleChangeUserTagPermission}
                    pendingUserList={pendingUserList}
                    searchType={currentDocument.documentType}
                    handleSetMessage={handleError}
                    handleRemoveUserTag={handleRemoveUserTag}
                    documentId={currentDocument._id}
                    themeMode={themeMode}
                    shareMessage={shareMessage}
                    isReskin={isEnableReskin}
                    autoFocus={shouldAutoFoucusOnInput}
                  />
                )}
                {shareMessage ? (
                  <>
                    <AddMessageComponent
                      shareMessage={message}
                      setShareMessage={handleChangeShareMessage}
                      classNames="ShareModal__message"
                    />
                    <Footer onClose={onClose} openInviteSharedUser={openInviteSharedUser} />
                  </>
                ) : (
                  <MemberList />
                )}
              </Styled.TopBlockContainerReskin>
              {!shareMessage && (
                <Styled.BottomBlockContainerReskin shadow="lg" radius="lg">
                  <ShareLinkSection openShareSetting={openShareSetting} isShareLinkOpen={isShareLinkOpen} />
                </Styled.BottomBlockContainerReskin>
              )}
            </>
          )}
        </ShareModalRenderer>
      </Dialog>
    );
  }

  return (
    <LazyContentDialog
      open
      classes={customClasses}
      onClose={onClose}
      scroll="body"
      /*
        [LP-8479]
        Add "notranslate" class to this modal to prevent google translate
        To get more details about this issue, please follow these:
        - The issue: https://github.com/facebook/react/issues/11538
        - The solution: https://stackoverflow.com/questions/12238396/how-to-disable-google-translate-from-html-in-chrome/12238414#12238414
      */
      className={`theme-${themeMode} notranslate`}
      fallback={<ModalSkeleton />}
      width={ModalSize.MDX}
    >
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
              <Title
                hasPermission={hasPermission}
                onBack={() => setShareMessage(false)}
                showBackButton={shareMessage}
                documentName={currentDocument.name}
                enableEditDocumentActionPermission={enableEditDocumentActionPermission}
              />
              {!isLuminStorageDocument && (
                <Styled.SubTitle>
                  <Trans
                    i18nKey="modalShare.willStoredAtLumin"
                    components={{ b: <b /> }}
                    values={{ name: fileUtils.getShortFilename(currentDocument.name) }}
                  />
                </Styled.SubTitle>
              )}

              <RequestAccessSection total={totalRequest} openFullList={openFullRequestList}>
                {renderRequestAccessContent}
              </RequestAccessSection>
              {hasPermission && (
                <AddShareMemberInput
                  members={members}
                  userTags={userTags}
                  setShareMessage={setShareMessage}
                  handleAddUserTag={handleAddUserTag}
                  handleAddPendingUserTag={handleAddPendingUserTag}
                  handleChangeUserTagPermission={handleChangeUserTagPermission}
                  pendingUserList={pendingUserList}
                  searchType={currentDocument.documentType}
                  handleSetMessage={handleError}
                  handleRemoveUserTag={handleRemoveUserTag}
                  documentId={currentDocument._id}
                  themeMode={themeMode}
                  shareMessage={shareMessage}
                  autoFocus={shouldAutoFoucusOnInput}
                />
              )}
              {shareMessage ? (
                <>
                  <AddMessageComponent
                    shareMessage={message}
                    setShareMessage={handleChangeShareMessage}
                    classNames="ShareModal__message"
                  />
                  <Footer onClose={onClose} openInviteSharedUser={openInviteSharedUser} />
                </>
              ) : (
                <>
                  <MemberList />
                  <Styled.TopBlockFooter $useGrid={canBulkUpdate}>
                    {canBulkUpdate && (
                      <ButtonMaterial color={ButtonColor.TERTIARY} onClick={openBulkUpdate}>
                        {t('modalShare.bulkUpdatePermissions')}
                      </ButtonMaterial>
                    )}
                    <Styled.DoneButton onClick={handleOnClose} loading={isTransfering}>
                      {capitalize(t('common.done'))}
                    </Styled.DoneButton>
                  </Styled.TopBlockFooter>
                </>
              )}
            </Styled.TopBlockContainer>
            {!shareMessage && (
              <Styled.BottomBlockContainer>
                <ShareLinkSection openShareSetting={openShareSetting} isShareLinkOpen={isShareLinkOpen} />
              </Styled.BottomBlockContainer>
            )}
          </>
        )}
      </ShareModalRenderer>
    </LazyContentDialog>
  );
};

ShareModal.propTypes = {
  orgOfDoc: PropTypes.object,
  setShowDiscardModal: PropTypes.func,
  resetTagsState: PropTypes.func,
};

ShareModal.defaultProps = {
  orgOfDoc: {},
  setShowDiscardModal: () => {},
  resetTagsState: () => {},
};

export default ShareModal;
