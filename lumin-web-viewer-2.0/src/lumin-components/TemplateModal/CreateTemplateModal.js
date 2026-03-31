import React from 'react';
import PropTypes from 'prop-types';
import TemplateController from 'lumin-components/TemplateModal/TemplateController';
import { useCurrentTemplateList } from 'hooks';
import { TEMPLATE_TABS, TEMPLATE_FIELD } from 'constants/templateConstant';
import { COMMON_FORM_INFO, FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';

const FORM_EVENT = {
  ...COMMON_FORM_INFO.uploadTemplate,
  [TEMPLATE_FIELD.NAME]: FORM_INPUT_NAME.TEMPLATE_NAME,
  [TEMPLATE_FIELD.THUMBNAIL]: FORM_INPUT_NAME.TEMPLATE_THUMBNAIL,
  [TEMPLATE_FIELD.DESCRIPTION]: FORM_INPUT_NAME.TEMPLATE_DESCRIPTION,
};
function CreateTemplateModal({
  defaultValues,
  onSubmit,
  onClose,
}) {
  const [templateType] = useCurrentTemplateList();
  const shouldShowNotify = templateType === TEMPLATE_TABS.ORGANIZATION;

  return (
    <TemplateController
      title="Upload Template"
      submitLabel="Upload"
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onClose={onClose}
      showNotify={shouldShowNotify}
      formEvent={FORM_EVENT}
    />
  );
}

CreateTemplateModal.propTypes = {
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  defaultValues: PropTypes.object,
};
CreateTemplateModal.defaultProps = {
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  defaultValues: {},
};

export default CreateTemplateModal;
