import { AnyAction } from 'redux';

import { PasswordModalSourceType } from 'lumin-components/PasswordModal/constants/PasswordModal.enum';

import { TreeNode } from 'features/Outline/types';

import { IPresenterModeState } from 'interfaces/redux/viewer.redux.interface';

export function setNoteEditingAnnotationId(id: string): AnyAction;

export function disableElement(dataElement: string, priority: number): AnyAction;

export function disableElements(dataElements: string[], priority: number): AnyAction;

export function setOutlines(outlines: TreeNode): AnyAction;

export function enterPresenterMode(restoreState: IPresenterModeState['restoreState']): AnyAction;

export function exitPresenterMode(): AnyAction;

export function setPasswordProtectedDocumentName(name: string): AnyAction;

export function setPasswordModalSource(source: PasswordModalSourceType): AnyAction;

export declare function resetSearch(): AnyAction;

export declare function setShowNotesOption(option: string): AnyAction;
