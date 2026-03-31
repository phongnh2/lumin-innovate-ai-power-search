import { BackdropMessageConfigs } from 'actions/customActions';

import { RootState } from 'store';

import { CareTaker } from 'screens/Viewer/undoRedo';

import { DocumentActionCapabilities } from 'features/DocumentActionPermission';
import { SummarizationErrorTypes } from 'features/DocumentSummarization/constants';

import { AnimationBanner } from 'constants/banner';

import { ILocationCurrency } from 'interfaces/auth';
import { IDocumentBase } from 'interfaces/document/document.interface';
import { IBillingWarningState, IUserSignPayment } from 'interfaces/payment/payment.interface';
import { IPresenterModeState } from 'interfaces/redux/viewer.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

export function getCurrentDocument(state: RootState): IDocumentBase;

export function getCurrentUser(state: RootState): IUser;

export function getNoteDateFormat(state: RootState): string;

export function isOffline(state: RootState): boolean;

export function getShowedBanner(state: RootState, bannerName: string): boolean;

export function shouldShowRating(state: RootState): typeof AnimationBanner[keyof typeof AnimationBanner];

export function getCommentPos(state: RootState, annotationId: string): number;

export function getIsNoteEditing(state: RootState): boolean;

export function getNoteEditingAnnotationId(state: RootState): string;

export function getShowNotesOption(state: RootState): string;

export function getSortStrategy(state: RootState): string;

export function getCurrentPage(state: RootState): number;

export function getToolAutoEnabled(state: RootState): string;

export function getOpenQRCode(state: RootState): boolean;

export function getLocationCurrency(state: RootState): ILocationCurrency;

export function getIsOpenSignModal(state: RootState): boolean;

export function getIsOpenIntegrateModal(state: RootState): boolean;

export function getTotalPages(state: RootState): number;

export function getThemeMode(state: RootState): 'light' | 'dark';

export function isElementDisabled(state: RootState, element: string): boolean;

export function isAuthenticating(state: RootState): boolean;

export function getThumbs(state: RootState): Record<string, unknown>[];

export function getForceReloadVersion(state: RootState): boolean;

export function hasUserLocationLoaded(state: RootState): boolean;

export function getUserSignPayment(state: RootState): IUserSignPayment;

export function getOutlineEvent(state: RootState): string;

export function getIsLoadingDocumentOutlines(state: RootState): boolean;

export function hasGTMLoaded(state: RootState): boolean;

export function getIsSummarizing(state: RootState): boolean;

export function getIsRegeneratingSummary(state: RootState): boolean;

export function getSummarizedErrorCode(state: RootState): keyof typeof SummarizationErrorTypes;

export function getDocumentTextContent(state: RootState): string;

export function getBillingWarning(state: RootState): IBillingWarningState;

export function getCurrentSummaryDocVersion(state: RootState): number;

export function isSourceDownloading(state: RootState): boolean;

export function getIsFetchingCurrentDocument(state: RootState): boolean;

export function getFoundDocumentScrolling(state: RootState, folderType: string): boolean;

export function isInPresenterMode(state: RootState): boolean;

export function presenterModeRestoreState(state: RootState): IPresenterModeState['restoreState'];

export function getPurchaseState(state: RootState): boolean;

export function getBackDropMessage(state: RootState): string;

export function getBackDropConfigs(state: RootState): BackdropMessageConfigs;

export function isPageToolDisabled(state: RootState): boolean;

export function canModifyDriveContent(state: RootState): boolean;

export function getDocumentCapabilities(state: RootState): DocumentActionCapabilities;

export function isModalOpen(state: RootState): boolean;

export function getActionCountDocStack(state: RootState): Record<string, unknown>;

export function getModalData(state: RootState): Record<string, unknown>;

export function isWaitingForEditBoxes(state: RootState): boolean;

export function getShouldShowInviteCollaboratorsModal(state: RootState): boolean;

export function getCareTaker(state: RootState): CareTaker;

export function getShowTrialModal(state: RootState): boolean;

export function getError(state: RootState): {
  reason: string | null;
  errorCode: string | null;
  statusCode: number | null;
  metadata: Record<string, unknown> | null;
  operationName: string | null;
  message: string | null;
};

export function getIsShowBannerAds(state: RootState): boolean;
