import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';

import actions from 'actions';
import { errorUtils, toastUtils } from 'utils';
import selectors from 'selectors';
import { ModalTypes } from 'constants/lumin-common';
import { TEMPLATE_TABS } from 'constants/templateConstant';
import { useCurrentTemplateList, useForceReloadModal, useTranslation } from 'hooks';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION, ORGANIZATION_TEXT } from 'constants/organizationConstants';
import templateServices from 'services/templateServices';
import { ErrorCode } from 'constants/errorCode';
import { Trans } from 'react-i18next';

export const withDeleteTemplate = (Component) => {
  const HOC = (props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { onDeleted, template } = props;
    const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
    const { totalActiveMember } = currentOrganization;
    const [templateType] = useCurrentTemplateList();
    const { openModal: openReloadModal } = useForceReloadModal();

    const getCheckBoxMessage = () => {
      if (templateType === TEMPLATE_TABS.ORGANIZATION) {
        return `Notify ${
          totalActiveMember <= MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION
            ? `${ORGANIZATION_TEXT} members about this action`
            : `administrators in that ${ORGANIZATION_TEXT}`
        }`;
      }
      return '';
    };

    const handleError = (e) => {
      const { code } = errorUtils.extractGqlError(e);
      if (code === ErrorCode.Template.TEMPLATE_NOT_FOUND) {
        openReloadModal();
        return;
      }
      toastUtils.error({
        message: t('templatePage.failedToDeleteTemplate'),
      });
    };

    const handleDeleteTemplate = async (isCheckedNotify) => {
      try {
        dispatch(actions.updateModalProperties({
          isProcessing: true,
        }));
        await templateServices.from(templateType).deleteTemplate({
          templateId: template._id,
          isNotify: isCheckedNotify,
        });
        onDeleted(template);
        toastUtils.success({
          message: t('templatePage.templateHasBeenDeleted'),
        });
        dispatch(actions.closeModal());
      } catch (e) {
        handleError(e);
      }
    };
    const openDeleteTemplateModal = (template) => {
      const checkboxMessage = getCheckBoxMessage();
      const contentModal = {
        type: ModalTypes.WARNING,
        title: t('templatePage.deleteTemplate'),
        message: (
          <Trans i18nKey="messageDeleteTemplate">
            Your collaborators can no longer access <b>{{ name: template.name }} template</b>. This action cannot be
            undone.
          </Trans>
        ),
        isProcessing: false,
        cancelButtonTitle: t('common.cancel'),
        confirmButtonTitle: t('common.delete'),
        closeOnConfirm: false,
        onCancel: () => {},
        onConfirm: handleDeleteTemplate,
        checkboxMessage,
      };
      dispatch(actions.openModal(contentModal));
    };
    return <Component {...props} openDeleteTemplateModal={openDeleteTemplateModal} />;
  };

  HOC.propTypes = {
    template: PropTypes.object,
    onDeleted: PropTypes.func.isRequired,
  };
  HOC.defaultProps = {
    template: {},
  };

  return HOC;
};
