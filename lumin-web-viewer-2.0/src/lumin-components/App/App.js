/* eslint-disable sonarjs/cognitive-complexity */
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router';
import { compose } from 'redux';

import { useSyncingDocumentHandler } from '@new-ui/hooks/useSyncingDocumentHandler';
import ViewerContext from 'src/screens/Viewer/Context';

import actions from 'actions';
import selectors from 'selectors';

import CustomPrompt from 'lumin-components/CustomPrompt';
import { DOCUMENT_DECORATOR_ACTION } from 'lumin-components/DocumentList/hooks/useAuthenticateService';
import GeneralLayout from 'lumin-components/GeneralLayout';
import QRCodeDialog from 'lumin-components/QRCodeDialog';
import CopyDocumentModalContainer from 'lumin-components/TransferDocument/components/CopyDocumentModal';
import { MoveDocumentModalContainer } from 'lumin-components/TransferDocument/components/MoveDocumentModal';
import WarningBanner from 'lumin-components/WarningBanner';
import AccessUpdateToast from 'luminComponents/AccessUpdateToast';
import AutoSyncProvider from 'luminComponents/AutoSync/AutoSyncProvider';
import OneDriveFilePickerProvider from 'luminComponents/OneDriveFilePicker/OneDriveFilePickerProvider';
import EditorThemeProvider from 'luminComponents/ViewerCommonV2/ThemeProvider';

import withRemoveUserAccount from 'HOC/withRemoveUserAccount';
import withWarningBanner from 'HOC/withWarningBanner';

import DocumentToolModals from 'hooks/DocumentToolModals';
import useGetOwnCurrentDoc from 'hooks/useGetOwnCurrentDoc';
import useTrackingOidcAuth from 'hooks/useTrackingOidcAuth';

import userServices from 'services/userServices';

import { lazyWithRetry } from 'utils/lazyWithRetry';
import { mappingDownloadTypeWithMimeType } from 'utils/mappingDownloadTypeWithMimeType';

import { useEnableAITool } from 'features/AgreementGen/hooks/useEnableAITool';
import { agreementGenSelectors } from 'features/AgreementGen/slices';
import ModalManager from 'features/CNC/CncComponents/ModalManager';
import useShowCreateCertifiedVersionBanner from 'features/DigitalSignature/hooks/useShowCreateCertifiedVersionBanner';
import DocumentInfoModalContainer from 'features/DocumentInfoModalContainer';
import { useBackupData } from 'features/DocumentRevision/hooks/useBackupData';
import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';
import useEnableToolFromQueryParams from 'features/EnableToolFromQueryParams/hooks/useEnableToolFromQueryParam';
import { SyncedQueueProvider } from 'features/FileSync';
import GoogleOneTapPromptAnchor from 'features/GoogleOneTap/components/GoogleOneTapPromptAnchor';
import { useShowXeroBanner } from 'features/MiniApps/hooks/useShowXeroBanner';
import { MultiStepFeedbackForm } from 'features/MultistepFeedbackForm';
import { feedbackFormSelector, closeFeedbackForm } from 'features/MultistepFeedbackForm/slice';
import { selectors as quotaExternalStorageSelectors } from 'features/QuotaExternalStorage/slices';
import { saveAsTemplateSelectors } from 'features/SaveAsTemplate/slices';
import AccessToolModal from 'features/ToolPermissionChecker/components/AccessToolModal';

import { LocalStorageKey } from 'constants/localStorageKey';
import { Routers } from 'constants/Routers';

import { useCloseMultiFeedbackForm } from './hooks/useCloseMultiFeedbackForm';
import { useDragAcrossPage } from './hooks/useDragAcrossPage';
import { useLastView } from './hooks/useLastView';
import { useSignatureHandlers } from './hooks/useSignatureHandlers';

import './App.scss';

const TimeLimit = lazyWithRetry(() => import('lumin-components/TimeLimit'));

const ViewerModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/GeneralLayout/components/ViewerModal/ViewerModal')
);
const CreateSignatureModal = lazyWithRetry(() =>
  import(
    /* webpackPrefetch: true */ 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/SignatureTool/components/CreateSignatureModal'
  )
);
const NewAnnotationPopup = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/GeneralLayout/components/AnnotationPopup')
);
const NewTextPopup = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/GeneralLayout/components/TextPopup')
);
const ContextMenuPopup = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/ContextMenuPopup'));

const RubberStampModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/RubberStampModal'));

const RubberStampOverlay = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/RubberStampOverlay')
);
const CopyTextHandler = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/CopyTextHandler'));
const RequireUseCommentModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/RequireUseCommentModal')
);
const FormBuildTooltip = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/ViewerCommon/FormBuildTooltip')
);
const PlaceMultipleTimesTooltip = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/ViewerCommon/PlaceMultipleTimesTooltip')
);
const DefaultFileHandleModal = lazyWithRetry(() => import('lumin-components/DefaultFileHandleModal'));

const LuminCommentPopup = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ '@new-ui/components/LuminCommentPopUp')
);
const ViewerProgressModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/GeneralLayout/components/ViewerProgressModal')
);

const AnnotationContentOverlay = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/AnnotationContentOverlay')
);
const DisconnectToast = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/DisconnectToast'));
const FileWarningModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/FileWarningModal'));
const PrintHandler = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/PrintHandler'));
const ZoomOverlay = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/ZoomOverlay'));
const IntegrateLuminModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/IntegrateLuminModal')
);
const PortalHolder = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/PortalHolder'));
const SaveAsModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/SaveAsModal'));

const TextFieldAutocomplete = lazyWithRetry(() => import('@new-ui/general-components/TextFieldAutocomplete'));

const FreeTextPreview = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'luminComponents/ViewerCommon/FreeTextPreview')
);

const EditInAgreementGen = lazyWithRetry(() => import('features/AgreementGen/components/EditInAgreementGen'));

const InviteCollaboratorsModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'features/CNC/CncComponents/InviteCollaboratorsModal')
);

const MakeACopyModalContainer = lazyWithRetry(() =>
  import('features/CopyDocumentModal/components/MakeACopyModalContainer')
);

const UnableSyncDocument = lazyWithRetry(() => import('luminComponents/UnableSyncDocument'));
const RatingModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'features/RatingModal'));
const RenameDocumentModalContainer = lazyWithRetry(() => import('features/RenameDocumentModalContainer'));
const BottomToast = lazyWithRetry(() => import('features/BottomToast'));
const SaveAsTemplateModal = lazyWithRetry(() => import('features/SaveAsTemplate/components/SaveAsTemplateModal'));

const propTypes = {
  refetchDocument: PropTypes.func,
  offlineEnabled: PropTypes.bool,
  showAccessUpdateToast: PropTypes.bool.isRequired,
  isNarrowScreen: PropTypes.bool,
  isInPresenterMode: PropTypes.bool,
};

const defaultProps = {
  refetchDocument: () => {},
  offlineEnabled: false,
  isNarrowScreen: false,
  isInPresenterMode: false,
};

const WarningContainer = (props) => (
  <div id="WarningBanner__container" className="WarningBanner__container">
    {props.children}
  </div>
);

WarningContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = ({ refetchDocument, offlineEnabled, showAccessUpdateToast, isNarrowScreen, isInPresenterMode }) => {
  const [
    isPageEditMode,
    themeMode,
    currentUser,
    isNotFoundDocument,
    currentDocument,
    isOffline,
    forceReload,
    isLoadingDocument,
    isInContentEditMode,
    isPreviewOriginalVersionMode,
  ] = useSelector(
    (state) => [
      selectors.isPageEditMode(state),
      selectors.getThemeMode(state),
      selectors.getCurrentUser(state),
      selectors.isNotFoundDocument(state),
      selectors.getCurrentDocument(state),
      selectors.isOffline(state),
      selectors.isForceReload(state),
      selectors.isLoadingDocument(state),
      selectors.isInContentEditMode(state),
      selectors.isPreviewOriginalVersionMode(state),
    ],
    shallowEqual
  );

  const isEditInAgreementGenModalOpen = useSelector(agreementGenSelectors.isEditInAgreementGenModalOpen);
  const isFeedbackFormEnabled = useSelector(feedbackFormSelector.isEnabled);
  const shouldShowInviteCollaboratorsModal = useSelector(selectors.getShouldShowInviteCollaboratorsModal);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDefaultFileTutorial, setOpenDefaultFileTutorial] = useState(false);
  const { reloadDocument, allowShowExpiredToast, accessUpdateToastTitle } = useContext(ViewerContext);
  const { enabled: isEnabledChatBot } = useEnabledChatBot();
  const { isSystemFile } = currentDocument || {};
  const { enabled: enabledAITool } = useEnableAITool();
  const isExceedQuotaExternalStorage = useSelector(quotaExternalStorageSelectors.getIsExceedQuotaExternalStorage);
  const isOpenSaveAsTemplate = useSelector(saveAsTemplateSelectors.isOpenSaveAsTemplate);

  useEnableToolFromQueryParams({ disabled: isNarrowScreen || isInPresenterMode });

  useDragAcrossPage();

  useBackupData();

  useShowCreateCertifiedVersionBanner();

  useEffect(() => {
    dispatch(
      actions.setMinimizeBananaSign({
        isMinimizeBananaSign: Boolean(JSON.parse(localStorage.getItem(LocalStorageKey.IS_MINIMIZED_BANANASIGN_BUTTON))),
      })
    );
  }, []);

  useEffect(() => {
    if (forceReload) {
      reloadDocument();
      dispatch(actions.setForceReload(false));
    }
  }, [forceReload]);

  useEffect(() => {
    if (!isLoadingDocument) {
      const disableSystemFileTutorial = localStorage.getItem(LocalStorageKey.DISABLE_SET_DEFAULT_FILE_TUTORIAL);
      setOpenDefaultFileTutorial(!disableSystemFileTutorial && isSystemFile);
    }
  }, [isSystemFile, isLoadingDocument]);

  useEffect(() => {
    if (!isLoadingDocument) {
      const hubspotAutoSync = localStorage.getItem('hubspotAutoSync');
      if (!hubspotAutoSync && currentUser) {
        localStorage.setItem('hubspotAutoSync', 'Yes');
        userServices.saveAutoSyncTrial();
      }
    }
  }, [currentUser, isLoadingDocument]);

  useTrackingOidcAuth({ currentUser });

  useLastView();

  useSignatureHandlers();

  useCloseMultiFeedbackForm();

  useSyncingDocumentHandler();

  useShowXeroBanner();

  useEffect(() => {
    const downloadType = mappingDownloadTypeWithMimeType(currentDocument.mimeType);
    dispatch(actions.setDownloadType(downloadType));
  }, []);

  const { organization: orgOwnCurrentDocument } = useGetOwnCurrentDoc();

  const onCloseFeedbackForm = () => {
    dispatch(closeFeedbackForm());
  };

  const handleReloadDocument = () => {
    reloadDocument();
  };

  if (isEmpty(currentDocument)) {
    return null;
  }

  const renderToolForIdentifiedOnlineUser = () => {
    if (!currentUser || isOffline || isLoadingDocument) {
      return null;
    }

    const shouldHideActivityButton =
      isNarrowScreen ||
      isInPresenterMode ||
      forceReload ||
      isPageEditMode ||
      isInContentEditMode ||
      isPreviewOriginalVersionMode ||
      isEnabledChatBot;
    return (
      <>
        {!shouldHideActivityButton && <QRCodeDialog />}
        <IntegrateLuminModal />
      </>
    );
  };

  const renderLayoutContainer = ({ hasWarningBanner = false } = {}) => (
    <>
      <GeneralLayout hasWarningBanner={hasWarningBanner} />
      <LuminCommentPopup />
      <NewAnnotationPopup />
      {!isInPresenterMode && <NewTextPopup />}
      <ViewerModal />
      {!isLoadingDocument && (
        <>
          <ViewerProgressModal />

          {!isPageEditMode && <CreateSignatureModal />}
        </>
      )}
      <AccessToolModal />
      {enabledAITool && isEditInAgreementGenModalOpen && <EditInAgreementGen />}
    </>
  );

  const renderApp = ({ bannerShow = false } = {}) => (
    <div
      id="app-container"
      className={classNames(`App theme-${themeMode}`, {
        'App--banner-show': bannerShow,
      })}
    >
      <EditorThemeProvider>
        {renderLayoutContainer({ hasWarningBanner: bannerShow })}
        {!isLoadingDocument && currentDocument && (
          <>
            {allowShowExpiredToast && showAccessUpdateToast && (
              <AccessUpdateToast title={accessUpdateToastTitle} reloadDocument={handleReloadDocument} />
            )}
            <CustomPrompt />
            <PortalHolder />
            <DocumentToolModals refetchDocument={refetchDocument} />
            <DisconnectToast offlineEnabled={offlineEnabled} currentUser={currentUser} />
            {!isPageEditMode && (
              <>
                <RubberStampModal />
                <RubberStampOverlay />
                <ContextMenuPopup />
                <RequireUseCommentModal />
              </>
            )}
            <MoveDocumentModalContainer />
            <CopyDocumentModalContainer />
            <DocumentInfoModalContainer />
            <MakeACopyModalContainer />
            <RenameDocumentModalContainer />

            <AnnotationContentOverlay />
            <CopyTextHandler />
            <ModalManager organization={orgOwnCurrentDocument} />
            <FormBuildTooltip />
            <FreeTextPreview />
            <PlaceMultipleTimesTooltip />
            {openDefaultFileTutorial && (
              <DefaultFileHandleModal isOpen onClose={() => setOpenDefaultFileTutorial(false)} />
            )}
            {renderToolForIdentifiedOnlineUser()}
            <RatingModal />
            <ZoomOverlay />
            {isFeedbackFormEnabled && <MultiStepFeedbackForm onClose={onCloseFeedbackForm} />}
            {!isInPresenterMode && <SaveAsModal />}
            {isExceedQuotaExternalStorage && <UnableSyncDocument />}
            {shouldShowInviteCollaboratorsModal && <InviteCollaboratorsModal hasWarningBanner={bannerShow} />}
            {isOpenSaveAsTemplate && <SaveAsTemplateModal />}
            <TextFieldAutocomplete />
          </>
        )}
        {isNotFoundDocument && (
          <OneDriveFilePickerProvider>
            <FileWarningModal
              documents={[currentDocument]}
              documentAction={DOCUMENT_DECORATOR_ACTION.OPEN_DOCUMENT}
              onConfirm={() => navigate(Routers.DOCUMENTS)}
            />
          </OneDriveFilePickerProvider>
        )}
        <BottomToast />
        <GoogleOneTapPromptAnchor />
      </EditorThemeProvider>
    </div>
  );

  return (
    <SyncedQueueProvider>
      <AutoSyncProvider>
        <div className="App-container">
          {currentDocument?.isOverTimeLimit ? (
            <TimeLimit isOffline={isOffline} />
          ) : (
            <WarningBanner wrapper={WarningContainer}>
              {({ element }) => (
                <>
                  {element}
                  {renderApp({ bannerShow: !!element })}
                  {createPortal(<PrintHandler />, document.body)}
                </>
              )}
            </WarningBanner>
          )}
        </div>
      </AutoSyncProvider>
    </SyncedQueueProvider>
  );
};
App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default compose(withWarningBanner, withRemoveUserAccount)(App);
