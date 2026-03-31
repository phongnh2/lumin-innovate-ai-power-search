import getAnnotCommentData from './getAnnotCommentData';
import getThirdPartyFileInfo from './getThirdPartyFileInfo';
import handleRequestAccessCheck from './handleRequestAccessCheck';
import handleSignInDriveRequiredError from './handleSignInDriveRequiredError';
import handleSyncFileLuminStorage from './handleSyncFileLuminStorage';
import importFieldData from './importFieldData';
import isAdminUser from './isAdminUser';
import lockPage from './lockPage';
import recordGetStartedDocument from './recordGetStartedDocument';
import recordRenderPDFDocument from './recordRenderPDFDocument';
import sendEditOtherAnnotationNotification from './sendEditOtherAnnotationNotification';
import setDefaultFontSizeForTextField from './setDefaultFontSizeForTextField';
import setHoveringRedactionAnnotation from './setHoveringRedactionAnnotation';
import syncDocumentFromOfflineMode from './syncDocumentFromOfflineMode';
import unLockPage from './unLockPage';
import updateAnnotationAppearances from './updateAnnotationAppearances';
import updateImportedAnnot from './updateImportedAnnot';

export default {
  lockPage,
  unLockPage,
  updateImportedAnnot,
  setHoveringRedactionAnnotation,
  isAdminUser,
  getAnnotCommentData,
  handleRequestAccessCheck,
  recordGetStartedDocument,
  recordRenderPDFDocument,
  handleSignInDriveRequiredError,
  handleSyncFileLuminStorage,
  syncDocumentFromOfflineMode,
  importFieldData,
  setDefaultFontSizeForTextField,
  sendEditOtherAnnotationNotification,
  getThirdPartyFileInfo,
  updateAnnotationAppearances,
};
