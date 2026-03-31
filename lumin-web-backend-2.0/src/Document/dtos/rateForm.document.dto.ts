import { MongoId } from 'Common/validator/rest.validator';

export class RateFormDto {
    @MongoId()
      formId: string;

    rate: number;
}
