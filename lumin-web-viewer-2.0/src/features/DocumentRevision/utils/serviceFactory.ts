import { documentStorage } from 'constants/documentConstants';

import { GoogleDocumentRevision } from '../google';
import { S3DocumentRevision } from '../s3';

class RevisionServiceFactory {
  // eslint-disable-next-line class-methods-use-this
  from(service: string) {
    switch (service) {
      case documentStorage.s3:
        return new S3DocumentRevision();
      case documentStorage.google:
        return new GoogleDocumentRevision();
      case documentStorage.dropbox:
      case documentStorage.system:
      case documentStorage.onedrive:
      default:
        throw new Error('Invalid document storage service');
    }
  }
}

const revisionServiceFactory = new RevisionServiceFactory();

export default revisionServiceFactory;
