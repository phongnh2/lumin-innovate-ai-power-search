import { AnyAction } from 'redux';

import { IDocumentBase } from 'interfaces/document/document.interface';

export function setCurrentDocument(document: IDocumentBase): AnyAction;

export function updateCurrentDocument(data: Partial<IDocumentBase>): AnyAction;

export function loadUserLocationSuccess(): AnyAction;

export function updateCurrentUser(data: unknown): AnyAction;

export function setIsCompletedGettingUserData(isCompleted: boolean): AnyAction;

export function fetchingCurrentDocumentComplete(data: IDocumentBase): AnyAction;

export function startFetchingCurrentDocument(): AnyAction;
