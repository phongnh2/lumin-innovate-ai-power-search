/* eslint-disable import/order */
import { combineReducers } from 'redux';

import initialState from 'src/redux/initialState';
import viewerReducer from 'reducers/viewerReducer';
import searchReducer from 'reducers/searchReducer';
import userReducer from 'reducers/userReducer';
import documentReducer from 'reducers/documentReducer';
import organizationReducer from 'reducers/organizationReducer';
import folderReducer from 'reducers/folderReducer';

// Dev by Lumin
import modalReducer from 'reducers/modalReducer';
import authReducer from 'reducers/authReducer';
import uploadingReducer from 'reducers/uploadingReducer';
import paymentReducer from 'reducers/paymentReducer';
import notificationReducer from 'reducers/notificationReducer';
import documentListReducer from 'reducers/documentListReducer';
import reportReducer from 'reducers/reportReducer';
import dialogReducer from 'reducers/dialogReducer';
import eventTrackingReducer from 'reducers/eventTrackingReducer';
import bannerReducer from 'reducers/bannerReducer';
import generalLayoutReducer from 'reducers/generalLayoutReducer';
import customReducer from 'reducers/customReducer';
import pageSearchReducer from './pageSearchReducer';
import homeReducer from './homeReducer';
import formFieldDetectionReducer from 'features/FormFieldDetection/slice';
import rubberStampReducer from 'features/RubberStamp/slices';
import passwordProtectionReducer from 'features/PasswordProtection/slices';
import readAloudReducer from 'features/ReadAloud/slices';
import feedbackFormReducer from 'features/MultistepFeedbackForm/slice';
import viewerNavigationReducer from 'features/ViewerNavigation/slices';
import accessToolModalReducer from 'features/ToolPermissionChecker/slices/accessToolModalSlice';
import formBuilderReducer from 'features/DocumentFormBuild/slices';
import documentUploadExternalReducer from 'features/DocumentUploadExternal/slices';
import toolbarReducer from '@new-ui/components/LuminToolbar/slices';
import leftSideBarReducer from '@new-ui/components/LuminLeftSideBar/slices';
import measureToolReducer from 'features/MeasureTool/slices';
import shareInSlackReducer from 'features/ShareInSlack/reducer/ShareInSlack.reducer';
import inviteLinkReducer from 'features/InviteLink/reducer/InviteLink.reducer';
import multipleDownloadReducer from 'features/MultipleDownLoad/slice';
import editorChatBotReducer from 'features/EditorChatBot/slices';
import compressPdfReducer from 'features/CompressPdf/slices';
import fullScreenReducer from 'features/FullScreen/slice';
import documentSyncReducer from 'features/Document/slices/document-sync.slice';
import agreementGenReducer from 'features/AgreementGen/slices';
import moveDocumentModalReducer from 'features/MoveDocumentModal/slice';
import webChatBotReducer from 'features/WebChatBot/slices';
import generalReducer from 'reducers/generalReducer';
import copyDocumentModalReducer from 'features/CopyDocumentModal/slice';
import quickSearchReducer from 'features/QuickSearch/slices';
import documentInfoModalReducer from 'features/DocumentInfoModalContainer/slices';
import chatbotFeedbackModalReducer from 'features/AIChatBot/components/ChatBotMenu/components/FeedbackModal/slices';
import quotaExternalStorageReducer from 'features/QuotaExternalStorage/slices';
import renameDocumentModalReducer from 'features/RenameDocumentModalContainer/slices';
import bottomToastReducer from 'features/BottomToast/slice';
import digitalSignatureReducer from 'features/DigitalSignature/slices';
import saveAsTemplateReducer from 'features/SaveAsTemplate/slices';

const appReducer = combineReducers({
  viewer: viewerReducer(initialState.viewer),
  search: searchReducer(initialState.search),
  user: userReducer(initialState.user),
  document: documentReducer(initialState.document),
  uploadingDocuments: uploadingReducer(initialState.uploadingDocuments),
  modal: modalReducer(initialState.modal),
  auth: authReducer(initialState.auth),
  payment: paymentReducer(initialState.payment),
  advanced: () => initialState.advanced,
  organization: organizationReducer(initialState.organization),
  notification: notificationReducer(initialState.notification),
  documentList: documentListReducer(initialState.documentList),
  report: reportReducer(initialState.report),
  folder: folderReducer(initialState.folder),
  dialog: dialogReducer(initialState.dialog),
  eventTracking: eventTrackingReducer(initialState.eventTracking),
  banner: bannerReducer(initialState.banner),
  generalLayout: generalLayoutReducer(initialState.generalLayout),
  custom: customReducer(initialState.custom),
  pageSearch: pageSearchReducer(initialState.pageSearch),
  home: homeReducer(initialState.home),
  formFieldDetection: formFieldDetectionReducer,
  rubberStamp: rubberStampReducer,
  passwordProtection: passwordProtectionReducer,
  readAloud: readAloudReducer,
  feedbackForm: feedbackFormReducer,
  viewerNavigation: viewerNavigationReducer,
  accessToolModal: accessToolModalReducer,
  formBuilder: formBuilderReducer,
  documentUploadExternal: documentUploadExternalReducer,
  toolbar: toolbarReducer,
  leftSideBar: leftSideBarReducer,
  agreementGen: agreementGenReducer,
  multipleDownload: multipleDownloadReducer,
  shareInSlack: shareInSlackReducer,
  measureTool: measureToolReducer,
  editorChatBot: editorChatBotReducer,
  compressPdf: compressPdfReducer,
  fullScreen: fullScreenReducer,
  documentSync: documentSyncReducer,
  inviteLink: inviteLinkReducer,
  moveDocumentModal: moveDocumentModalReducer,
  webChatBot: webChatBotReducer,
  general: generalReducer(initialState.general),
  copyDocumentModal: copyDocumentModalReducer,
  quickSearch: quickSearchReducer,
  documentInfoModal: documentInfoModalReducer,
  chatbotFeedbackModal: chatbotFeedbackModalReducer,
  quotaExternalStorage: quotaExternalStorageReducer,
  renameDocumentModal: renameDocumentModalReducer,
  bottomToast: bottomToastReducer,
  digitalSignature: digitalSignatureReducer,
  saveAsTemplate: saveAsTemplateReducer,
});

const rootReducer = (state, action) => {
  // when a logout action is dispatched it will reset redux state
  if (action.type === 'USER_LOGGED_OUT') {
    state = {
      ...initialState,
      viewer: {
        ...initialState.viewer,
        themeMode: 'light',
      },
      auth: {
        ...initialState.auth,
        gapiLoaded: state.auth.gapiLoaded,
      },
    };
  }

  return appReducer(state, action);
};

export default rootReducer;
