import { MongoId } from 'Common/validator/rest.validator';

export class CancelSyncSessionData {
  @MongoId()
    documentId: string;
}
