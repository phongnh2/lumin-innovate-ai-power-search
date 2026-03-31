import { COMPRESS_RESOLUTION, COMPRESS_QUALITY } from '../constants';

export type CompressLevelType = typeof COMPRESS_RESOLUTION[keyof typeof COMPRESS_RESOLUTION];

export type CompressPdfState = {
  compressLevel: CompressLevelType;
  isEditingCompressOptions: boolean;
  compressOptions: CompressOptionsType;
};

export type CompressLevelProps = {
  transKey: string;
  quality: COMPRESS_QUALITY;
  resolution: CompressLevelType;
};

export type CompressLevelValidationType = {
  isMember: boolean;
  canStartTrial: boolean;
  isFileSizeExceed: boolean;
  isBusinessOrEnterprisePlan: boolean;
  isCompressLevelDisabled?: (quality: COMPRESS_QUALITY) => boolean;
  enableServerCompression: boolean;
};

export type CompressOptionsType = {
  compressLevel?: CompressLevelType;
  isDownSample: boolean;
  dpiImage: number;
  isEmbedFont: boolean;
  isSubsetFont: boolean;
  removeAnnotation: boolean;
  removeDocInfo: boolean;
  documentPassword?: string;
};

export type CompressCompletedType = {
  documentId: string;
  presignedUrl?: string;
  error?: string;
};

export type CompressDpiOptions = {
  icon: string;
  value: number;
  title: string;
  description: string;
};
