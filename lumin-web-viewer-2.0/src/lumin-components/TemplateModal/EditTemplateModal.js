import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router';

import TemplateContext from 'screens/Templates/context';

import useGetTemplate from 'lumin-components/PreviewTemplateModal/hooks/useGetTemplate';
import TemplateController from 'lumin-components/TemplateModal/TemplateController';

import { useForceReloadModal, useTranslation } from 'hooks';

import { templateServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, file } from 'utils';

import { ErrorCode } from 'constants/errorCode';

function EditTemplateModal({
  templateId,
  onClose,
  onEdited,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { getTemplates } = useContext(TemplateContext);
  const { template: currentTemplate } = useGetTemplate(templateId, { getTemplates });

  const onConfirm = () => {
    getTemplates();
    navigate(location.pathname, { replace: true });
  };
  const { openModal: openReloadModal } = useForceReloadModal({ onConfirm });

  const onSubmitChange = async (template) => {
    try {
      const data = await templateServices.editTemplate({
        template,
        thumbnailFile: template.thumbnail,
      });
      onEdited(data);
      return data;
    } catch (err) {
      const { code } = errorUtils.extractGqlError(err);
      if (code === ErrorCode.Template.TEMPLATE_NOT_FOUND) {
        openReloadModal();
      }
      logger.logError({ error: err });
      return ({ error: err });
    }
  };

  return (currentTemplate && (
    <TemplateController
      title={t('templatePage.editTemplate')}
      submitLabel={t('common.save')}
      defaultValues={{
        templateId,
        name: file.getFilenameWithoutExtension(currentTemplate.name),
        thumbnail: { file: currentTemplate.thumbnail },
        description: currentTemplate.description,
      }}
      isEditMode
      onSubmit={onSubmitChange}
      onClose={onClose}
    />
  ));
}

EditTemplateModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onEdited: PropTypes.func.isRequired,
  templateId: PropTypes.string.isRequired,
};

EditTemplateModal.defaultProps = {
};

export default EditTemplateModal;
