export type SignatureSyncStatus = 'syncing' | 'deleting' | 'adding';

export interface Signature {
  width: number;
  height: number;
  imgSrc: string;
  id?: string;
  remoteId?: string;
  status?: SignatureSyncStatus;
  signedUrl?: string;
  /**
   * @description temporary index for the locally generated signature; we need to retain the old name `index` to minimize impact on other parts of the codebase.
   */
  index?: string;
}

export interface SignatureServerResponse {
  id: string;
  remoteId: string;
  signedUrl: string;
}
