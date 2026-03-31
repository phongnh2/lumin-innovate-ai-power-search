import { RootState } from 'store';

export function isRightPanelOpen(state: RootState): boolean;

export function isToolPropertiesOpen(state: RootState): boolean;

export function toolPropertiesValue(state: RootState): string;

export function isLeftPanelOpen(state: RootState): boolean;

export function toolbarValue(state: RootState): string;

export function leftPanelValue(state: RootState): string;

export function rightPanelValue(state: RootState): string;

export function isOpenSearchOverlay(state: RootState): boolean;

export function isCommentPanelOpen(state: RootState): boolean;

export function isDefaultMode(state: RootState): boolean;

export function isInFocusMode(state: RootState): boolean;
