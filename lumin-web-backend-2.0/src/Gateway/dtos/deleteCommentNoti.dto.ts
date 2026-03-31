import { IsEmail } from 'class-validator';

import { MongoId } from 'Common/validator/rest.validator';

export class DeleteCommentNotiData {
  @IsEmail()
    ownerCommentEmail: string;

  @MongoId()
    documentId: string;

  @MongoId()
    actorId: string;
}
