export type ValidationType = {
  validateExtensions: string[],
  limitSize: number,
  optional?: boolean,
}

export type FileInput = {
  createReadStream: any,
  mimetype: string,
  encode: string,
  filename: string
}

export type FileTransformType = {
  promise: Promise<FileInput>
  file: FileInput
}

export enum UploadFileTypeEnum {
  Thumbnail = 'thumbnail',
  Template = 'template',
  Document = 'document'
}

export type UploadFileType = (typeof UploadFileTypeEnum)[keyof typeof UploadFileTypeEnum];

export type FilesTransformListType = {
  type: UploadFileType,
  file: FileTransformType
}
