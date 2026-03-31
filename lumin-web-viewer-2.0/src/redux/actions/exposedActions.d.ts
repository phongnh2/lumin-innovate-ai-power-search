import { AnyAction } from 'redux';

import { DataElement } from 'constants/dataElement';

export function openElement(dataElement: string): AnyAction;

export function openSignInModal(modal: string): AnyAction;

export function setIsRightPanelOpen(arg: any): AnyAction;

export function setIsToolPropertiesOpen(arg: boolean): AnyAction;

export function setDocumentNotFound(): AnyAction;

export function setDiscardContentEdit(isDiscardContentEdit: boolean): AnyAction;

export function setForceReload(isForceReload: boolean): AnyAction;

export function setIsInContentEditMode(isInContentEditMode: boolean): AnyAction;

/**
 * @deprecated this action is not used anymore due to it's old layout implementation
 */
export function setActiveHeaderGroup(headerGroup: string): AnyAction;

export function setIsShowToolbarTablet(isShowToolbarTablet: boolean): AnyAction;

export function setIsLoadingDocumentOutlines(isLoadingDocumentOutlines: boolean): AnyAction;

export function setIsSummarizing(isSummarizing: boolean): AnyAction;

export function setIsRegeneratingSummary(isRegeneratingSummary: boolean): AnyAction;

export function setCurrentSummaryDocVersion(currentSummaryDocVersion: number): AnyAction;

export function setOpenedElementData(dataElement: DataElement, openedElementData: Record<string, unknown>): AnyAction;

export function enableAllElements(): AnyAction;
