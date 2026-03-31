import { AWS_EVENTS } from '@/constants/awsEvents';
import { FormPurpose } from '@/constants/formName';

import analyticContainer from './analytic.container';
import { AWSAnalytics } from './aws-analytics';
import { BaseEvent } from './base.event';
import { DatadogAnalytics } from './datadog-analytics';

type TFormEvent = {
  formName: string;
  formPurpose: string;
  xPath: string;
};

type TFormFieldChange = TFormEvent & {
  fieldName: string;
  fieldPurpose: string;
  eventName?: string;
};

export class FormEventCollection extends BaseEvent {
  formSubmit({ formName, formPurpose, xPath }: TFormEvent) {
    return this.record({
      name: AWS_EVENTS.FORM.FORM_SUBMIT,
      attributes: {
        formName,
        formPurpose: FormPurpose[formName] || formPurpose,
        xPath
      }
    });
  }

  formReset({ formName, formPurpose, xPath }: TFormEvent) {
    return this.record({
      name: AWS_EVENTS.FORM.FORM_RESET,
      attributes: {
        formName,
        formPurpose: FormPurpose[formName] || formPurpose,
        xPath
      }
    });
  }

  formFieldChange({ formName, formPurpose, fieldName, fieldPurpose, xPath, eventName = AWS_EVENTS.FORM.FORM_FIELD_CHANGE }: TFormFieldChange) {
    return this.record({
      name: eventName,
      attributes: {
        formName,
        formPurpose: FormPurpose[formName] || formPurpose,
        formFieldName: fieldName,
        formFieldPurpose: fieldPurpose,
        xPath
      }
    });
  }

  checkboxUpdated(params: TFormFieldChange) {
    return this.formFieldChange({
      ...params,
      eventName: AWS_EVENTS.FORM.CHECKBOX_UPDATED
    });
  }
}

export const formEvent = new FormEventCollection(analyticContainer.get(AWSAnalytics.providerName), analyticContainer.get(DatadogAnalytics.providerName));
