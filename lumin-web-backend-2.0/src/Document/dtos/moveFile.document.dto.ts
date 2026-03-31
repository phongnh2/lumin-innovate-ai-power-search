import { MongoId } from 'Common/validator/rest.validator';

export class MoveFileDto {
    @MongoId()
      documentId: string;

    @MongoId()
      clientId: string;
}
