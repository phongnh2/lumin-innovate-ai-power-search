import { AWS_EVENTS } from 'constants/awsEvents';
import { EventCollection } from '../EventCollection';

export class FormEventCollection extends EventCollection {
  formSubmit({
    formName,
    formPurpose,
    xPath,
  }) {
    return this.record({
      name: AWS_EVENTS.FORM.FORM_SUBMIT,
      attributes: {
        formName,
        formPurpose,
        xPath,
      },
    });
  }

  formReset({
    formName,
    formPurpose,
    xPath,
  }) {
    return this.record({
      name: AWS_EVENTS.FORM.FORM_RESET,
      attributes: {
        formName,
        formPurpose,
        xPath,
      },
    });
  }

  formFieldChange({
    formName,
    formPurpose,
    fieldName,
    fieldPurpose,
    xPath,
    eventName = AWS_EVENTS.FORM.FORM_FIELD_CHANGE,
  }) {
    return this.record({
      name: eventName,
      attributes: {
        formName,
        formPurpose,
        formFieldName: fieldName,
        formFieldPurpose: fieldPurpose,
        xPath,
      },
    });
  }

  checkboxUpdated(params) {
    return this.formFieldChange({
      ...params,
      eventName: AWS_EVENTS.FORM.CHECKBOX_UPDATED,
    });
  }
}

export default new FormEventCollection();
