export interface IOneDriveFile {
  '@odata.context': string;
  '@microsoft.graph.downloadUrl': string;
  createdDateTime: Date;
  eTag: string;
  id: string;
  name: string;
  file: {
    mimeType: string;
  }
  size: number;
  parentReference: {
    driveId: string,
  },
}
