import { AnyAction } from 'redux';

import { Signature } from 'features/Signature/interfaces';

export type BackdropMessageConfigs = {
  /**
   * @default 0
   * @description The delay time in milliseconds to close the backdrop message
   */
  closeDelay?: number;
  /**
   * @default 'loading'
   * @description The status of the backdrop message
   */
  status?: 'loading' | 'success' | 'error' | 'warning' | 'info';
};

export declare function updateUserSignatures(signatures: string[]): AnyAction;

export declare function deleteUserRemoteSignature(signatureRemoteId: string): AnyAction;

export declare function reorderSignature(fromIndex: number, endIndex: number): AnyAction;

export declare function addSignatures(signatures: Signature[]): AnyAction;

export declare function updateSignatureById(signatureId: string, signature: Partial<Signature>): AnyAction;

export function openModal(modalSetting: Record<string, unknown>): AnyAction;

export function setBackDropMessage(message: string, configs?: BackdropMessageConfigs): AnyAction;

export function setIsWaitingForEditBoxes(isWaiting: boolean): AnyAction;

export function setShouldShowInviteCollaboratorsModal(shouldShowInviteCollaboratorsModal: boolean): AnyAction;

export function setShowTrialModal(showTrialModal: boolean): AnyAction;

export function setError(error: {
  reason: string | null;
  errorCode: string | null;
  statusCode: number | null;
  metadata: Record<string, unknown> | null;
  operationName: string | null;
  message: string | null;
}): AnyAction;
