import { MongoId } from 'Common/validator/rest.validator';

export class UploadFileDto {
    @MongoId()
    userId: string;
}
