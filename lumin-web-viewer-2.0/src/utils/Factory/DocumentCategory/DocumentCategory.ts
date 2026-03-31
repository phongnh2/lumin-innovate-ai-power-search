import { DocumentService } from 'constants/document.enum';

export class DocumentCategory {
  static isGoogleDriveDocument({ type }: { type: DocumentService }) {
    return type === DocumentService.google;
  }

  static isLuminDocument({ type }: { type: DocumentService }) {
    return type === DocumentService.s3;
  }
}
