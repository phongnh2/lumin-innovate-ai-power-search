import { ToolName } from 'core/type';

import { RootState } from 'store';

import { PasswordModalSourceType } from 'luminComponents/PasswordModal/constants/PasswordModal.enum';

import { TreeNode } from 'features/Outline/types';
import { Signature } from 'features/Signature/interfaces';

import DataElements, { DataElement } from 'constants/dataElement';
import { LANGUAGES } from 'constants/language';

import { IPresenterModeState } from 'interfaces/redux/viewer.redux.interface';
import { IAnnotationStyle, IToolButton } from 'interfaces/viewer/viewer.interface';

export function getToolButtonObject(state: RootState, toolName: ToolName): IToolButton;

export function getLanguage(state: RootState): LANGUAGES;

export function hasAppliedRedaction(state: RootState): boolean;

export function isInContentEditMode(state: RootState): boolean;

export function isElementOpen(state: RootState, elementName: string): boolean;

export function getIconColor(state: RootState, toolKey: string): keyof Core.Annotations.StickyAnnotation;

export function isLoadingDocument(state: RootState): boolean;

export function isDocumentLoaded(state: RootState): boolean;

export function getAnnotationsLoaded(state: RootState): boolean;

export function getShowLoadingDocumentWarn(state: RootState): boolean;

export function getCurrentPage(state: RootState): number;

export function isElementDisabled(state: RootState, element: typeof DataElements[keyof typeof DataElements]): boolean;

export function getZoom(state: RootState): number;

export function getPageLabels(state: RootState): string[] | number[];

export function getActiveToolName(state: RootState): ToolName;

export function getActiveToolStyles(state: RootState): Record<string, unknown> | IAnnotationStyle;

export function pageEditDisplayMode(state: RootState): 'Grid' | 'Single';

export function isPreviewOriginalVersionMode(state: RootState): boolean;

export function isPageEditMode(state: RootState): boolean;

export function isConvertingBase64ToSignedUrl(state: RootState): boolean;

export function isNotFoundDocument(state: RootState): boolean;

export function isForceReload(state: RootState): boolean;

export function getEditPdfVersion(state: RootState): string;

export function getUserSignatures(state: RootState): Signature[];

export function getIsDocumentReady(state: RootState): boolean;

export function getMinimizeBananaSign(state: RootState): boolean;

export function getCommentPanelLayoutState(state: RootState): string;

export function getUserSignatureStatus(state: RootState): {
  isFetching: boolean;
  isSyncing: boolean;
  hasNext: boolean;
  isFetchedAfterMount: boolean;
};

export function getOutlines(state: RootState): TreeNode;

export function getIsCompletedGettingUserData(state: RootState): boolean;

export function getPasswordAttempts(state: RootState): number;

export function getPasswordMessage(state: RootState): string;

export function getPasswordModalSource(state: RootState): PasswordModalSourceType;

export function getPasswordProtectedDocumentName(state: RootState): string;

export function isEmbedPrintSupported(state: RootState): boolean;

export function getOpenedElementData(state: RootState, dataElement: DataElement): Record<string, unknown>;

export function isOpenModalData(state: RootState): Record<string, unknown>;

export function isFullScreen(state: RootState): boolean;

export function isInPresenterMode(state: RootState): boolean;

export function presenterModeRestoreState(state: RootState): IPresenterModeState['restoreState'];

export function viewerLoadingModalData(state: RootState): Record<string, unknown>;

export function getDownloadType(state: RootState): string;

export function getActiveToolGroup(state: RootState): string;

export function getIsMultipleViewerMerging(state: RootState): boolean;

export function isFlattenPdf(state: RootState): boolean;

export function getBookmarks(state: RootState): Core.Bookmark[];

export function getInternalAnnotationIds(state: RootState): string[];
