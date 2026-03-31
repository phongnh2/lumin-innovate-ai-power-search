import { ExternalStorageAttributes } from './externalStorage.interface';

type ImageRemoteId = string
type ImageSignedUrl = string

export interface DocumentInfo {
  _id: string;
  name: string;
  size: number;
  mimeType: string;
  manipulationStep: string;
  imageSignedUrls: Record<ImageRemoteId, ImageSignedUrl> | null;
  remoteId: string;
  signedUrl: string | null;
  externalStorageAttributes?: ExternalStorageAttributes;
}
