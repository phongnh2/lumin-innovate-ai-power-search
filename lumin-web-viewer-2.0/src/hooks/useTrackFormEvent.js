import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import formEvent, {
  FORM_INPUT_PURPOSE,
} from 'utils/Factory/EventCollection/FormEventCollection';
import { getCurrentFormXPath, getElementXPath } from 'utils/recordUtil';

export function useTrackFormEvent() {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { data, loading } = useSelector(
    selectors.getOrganizationList,
    shallowEqual,
  );
  const hasFetchedOrgList = !loading && data;
  /**
   * If authentication form, allow to track event
   * Otherwise, only track event after org list is fetched
   */
  const shouldTrackForm = Boolean(!currentUser || hasFetchedOrgList);

  const getTrackedFormInfo = (e) => {
    const trackedForm = e.target.closest('[data-lumin-form-name]');
    if (!trackedForm || !shouldTrackForm) {
      return null;
    }

    const { luminFormName, luminFormPurpose } = trackedForm.dataset;
    return {
      formName: luminFormName,
      formPurpose: luminFormPurpose,
    };
  };

  const withEventParams = (event, callback) => {
    const { name: inputName, dataset: inputDataset } = event.target;
    const { luminPurpose: purpose, luminName: dataName } = inputDataset;
    const xPathField = getElementXPath(event.target, true);
    const trackedForm = event.target.closest('[data-lumin-form-name]');
    const { luminFormName, luminFormPurpose } = trackedForm?.dataset || {};

    if (!trackedForm || !shouldTrackForm) {
      return;
    }

    const fieldName = dataName || inputName;
    const fieldPurpose = purpose || FORM_INPUT_PURPOSE[inputName];
    callback({
      formName: luminFormName,
      formPurpose: luminFormPurpose,
      fieldName,
      fieldPurpose,
      xPath: xPathField,
    });
  };

  const trackInputChange = (e) => withEventParams(e, formEvent.formFieldChange.bind(formEvent));

  const trackCheckboxUpdated = (e) => withEventParams(e, formEvent.checkboxUpdated.bind(formEvent));

  const trackSubmitForm = (e) => {
    const trackedFormInfo = getTrackedFormInfo(e);

    if (trackedFormInfo) {
      const formXPath = getCurrentFormXPath(e.target, true);

      formEvent.formSubmit({
        ...trackedFormInfo,
        xPath: formXPath,
      });
    }
  };

  const trackResetForm = (e) => {
    const trackedFormInfo = getTrackedFormInfo(e);

    if (trackedFormInfo) {
      const formXPath = getCurrentFormXPath(e.target, true);

      formEvent.formReset({
        ...trackedFormInfo,
        xPath: formXPath,
      });
    }
  };

  return {
    trackInputChange,
    trackSubmitForm,
    trackResetForm,
    trackCheckboxUpdated,
  };
}
