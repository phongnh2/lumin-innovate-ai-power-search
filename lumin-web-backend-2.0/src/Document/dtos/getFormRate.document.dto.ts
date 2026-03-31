import { MongoId } from 'Common/validator/rest.validator';

export class GetFormRateDto {
    @MongoId()
      formId: string;
}
