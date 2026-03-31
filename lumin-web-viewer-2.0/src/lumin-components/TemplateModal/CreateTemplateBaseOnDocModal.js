import React from 'react';
import PropTypes from 'prop-types';
import TemplateController from 'lumin-components/TemplateModal/TemplateController';

import { TEMPLATE_FIELD } from 'constants/templateConstant';
import { COMMON_FORM_INFO, FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';
import { useTranslation } from 'hooks';

const FORM_EVENT = {
  ...COMMON_FORM_INFO.createTemplate,
  [TEMPLATE_FIELD.NAME]: FORM_INPUT_NAME.TEMPLATE_NAME,
  [TEMPLATE_FIELD.THUMBNAIL]: FORM_INPUT_NAME.TEMPLATE_THUMBNAIL,
  [TEMPLATE_FIELD.DESCRIPTION]: FORM_INPUT_NAME.TEMPLATE_DESCRIPTION,
  [TEMPLATE_FIELD.DESTINATION]: FORM_INPUT_NAME.TEMPLATE_DESTINATION,
};

const CreateTemplateBaseOnDocModal = ({
  defaultValues,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  return (
    <TemplateController
      title={t('createBaseOnForm.createTemplate')}
      submitLabel={t('common.create')}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onClose={onClose}
      hasDestination
      formEvent={FORM_EVENT}
    />
  );
};

CreateTemplateBaseOnDocModal.propTypes = {
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  defaultValues: PropTypes.object,
};

CreateTemplateBaseOnDocModal.defaultProps = {
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  defaultValues: {},
};

export default CreateTemplateBaseOnDocModal;
