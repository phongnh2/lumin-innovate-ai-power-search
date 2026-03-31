import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

import TemplateContext from 'screens/Templates/context';

import { LazyContentDialog } from 'lumin-components/Dialog';
import PreviewTemplateSkeleton from 'lumin-components/PreviewTemplateModal/components/PreviewTemplateSkeleton';
import TemplateGrid from 'lumin-components/TemplateGrid';
import TemplateModal from 'lumin-components/TemplateModal';

import { useUrlSearchParams } from 'hooks';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { INFO_MODAL_TYPE } from 'constants/lumin-common';
import { ModalSize } from 'constants/styles/Modal';
import { TEMPLATE_UPDATE_ACTIONS } from 'constants/templateConstant';
import { UrlSearchParam, TemplateAction } from 'constants/UrlSearchParam';

const PreviewTemplateModal = lazyWithRetry(() => import('lumin-components/PreviewTemplateModal'));
const InfoModal = lazyWithRetry(() => import('lumin-components/InfoModal'));

function TemplateGridContainer({ templates, loading, pagination, onListChanged }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryUrl = useUrlSearchParams();
  const templateId = queryUrl.get(UrlSearchParam.TEMPLATE_ID);
  const action = queryUrl.get(UrlSearchParam.ACTION);
  const { getTemplates } = useContext(TemplateContext);

  const onClose = () => {
    navigate(location.pathname);
  };

  const getSearchParams = (_templateId, type) =>
    `?${UrlSearchParam.TEMPLATE_ID}=${_templateId}&${UrlSearchParam.ACTION}=${type}`;

  const onOpen = (type) => (_template) => {
    const url = getSearchParams(_template._id, type);
    navigate(url);
  };

  const updateTemplate = (_action) => (template) => onListChanged(template, _action);

  useEffect(() => {
    TemplateModal.Edit.preload();
  }, []);
  return (
    <>
      <TemplateGrid
        templates={templates}
        loading={loading}
        pagination={pagination}
        onListChanged={onListChanged}
        onPreview={onOpen(TemplateAction.PREVIEW)}
        onEdit={onOpen(TemplateAction.EDIT)}
        onInfo={onOpen(TemplateAction.INFO)}
      />
      {action === TemplateAction.PREVIEW && (
        <LazyContentDialog
          open
          fallback={<PreviewTemplateSkeleton />}
          onClose={onClose}
          noPadding
          scroll="body"
          width={ModalSize.XL}
        >
          <PreviewTemplateModal
            onClose={onClose}
            templateId={templateId}
            updateTemplate={updateTemplate(TEMPLATE_UPDATE_ACTIONS.UPDATE)}
          />
        </LazyContentDialog>
      )}
      {action === TemplateAction.EDIT && (
        <TemplateModal.Edit
          templateId={templateId}
          onEdited={updateTemplate(TEMPLATE_UPDATE_ACTIONS.EDIT)}
          onClose={onClose}
        />
      )}
      {action === TemplateAction.INFO && (
        <InfoModal
          open
          closeDialog={onClose}
          currentTarget={{ _id: templateId }}
          modalType={INFO_MODAL_TYPE.TEMPLATE}
          onErrorCallback={getTemplates}
        />
      )}
    </>
  );
}

TemplateGridContainer.propTypes = {
  templates: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.shape({
    offset: PropTypes.number,
    total: PropTypes.number,
    limit: PropTypes.number,
    onPageChange: PropTypes.func,
    onLimitChange: PropTypes.func,
  }).isRequired,
  onListChanged: PropTypes.func.isRequired,
};
TemplateGridContainer.defaultProps = {
  templates: [],
};

export default TemplateGridContainer;
