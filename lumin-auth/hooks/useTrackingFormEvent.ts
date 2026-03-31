import { BaseSyntheticEvent } from 'react';

import { FORM_INPUT_PURPOSE } from '@/constants/formInputName';
import { FormPurpose } from '@/constants/formName';
import { formEvent } from '@/lib/factory/form.event';
import { getElementXPath } from '@/lib/factory/utils';

export function useTrackFormEvent() {
  const getTrackForm = (e: BaseSyntheticEvent) => e.target.closest('[data-lumin-form-name]');

  const getTrackedFormInfo = (trackedForm: HTMLElement) => {
    const { luminFormName, luminFormPurpose } = trackedForm.dataset;
    if (!luminFormName) {
      return null;
    }
    return {
      formName: luminFormName,
      formPurpose: luminFormPurpose || FormPurpose[luminFormName]
    };
  };

  const withEventParams = ({ event, callback }: { event: BaseSyntheticEvent; callback: any }) => {
    const { name: inputName, dataset: inputDataset } = event.target;
    let { luminPurpose: purpose, luminName: dataName } = inputDataset;
    if (!dataName) {
      const trackedInput = event.target.closest('[data-lumin-name]');
      dataName = trackedInput?.dataset?.luminName;
      purpose = trackedInput?.dataset?.luminPurpose;
    }
    const xPathField = getElementXPath({ target: event.target, optimized: true });
    const trackedForm = event.target.closest('[data-lumin-form-name]');
    const { luminFormName, luminFormPurpose } = trackedForm?.dataset || {};

    if (!trackedForm) {
      return;
    }

    const fieldName = dataName || inputName;
    const fieldPurpose = purpose || FORM_INPUT_PURPOSE[inputName];
    callback({
      formName: luminFormName,
      formPurpose: luminFormPurpose,
      fieldName,
      fieldPurpose,
      xPath: xPathField
    });
  };

  const trackInputChange = (e: BaseSyntheticEvent) => withEventParams({ event: e, callback: formEvent.formFieldChange.bind(formEvent) });

  const trackSubmitForm = (e: BaseSyntheticEvent | undefined) => {
    if (!e) {
      return;
    }
    const trackedForm = getTrackForm(e);
    if (!trackedForm) {
      return;
    }
    const trackedFormInfo = getTrackedFormInfo(trackedForm);
    if (!trackedFormInfo) {
      return;
    }
    const formXPath = getElementXPath({ target: trackedForm, optimized: true });
    formEvent.formSubmit({
      ...trackedFormInfo,
      xPath: formXPath
    });
  };

  const trackResetForm = (e: BaseSyntheticEvent) => {
    const trackedForm = getTrackForm(e);
    if (!trackedForm) {
      return;
    }
    const trackedFormInfo = getTrackedFormInfo(trackedForm);

    if (trackedFormInfo) {
      const formXPath = getElementXPath({ target: trackedForm, optimized: true });

      formEvent.formReset({
        ...trackedFormInfo,
        xPath: formXPath
      });
    }
  };

  const trackCheckboxUpdated = (e: BaseSyntheticEvent) => withEventParams({ event: e, callback: formEvent.checkboxUpdated.bind(formEvent) });

  return {
    trackInputChange,
    trackSubmitForm,
    trackResetForm,
    trackCheckboxUpdated
  };
}
