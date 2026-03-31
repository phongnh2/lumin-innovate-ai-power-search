import React from 'react';
import PropTypes from 'prop-types';

import { ASSOCIATE_DOMAIN_MODAL_TYPE } from 'constants/lumin-common';
import { useTranslation } from 'hooks';

import useHandleSubmitAssociateDomain from './hook/useHandleSubmitAssociateDomain';
import ModalAssociateDomainController from './ModalAssociateDomainController';

const EditAddDomain = ({ defaultDomain, onClose }) => {
  const { t } = useTranslation();
  const { errorMessage, onSubmit } = useHandleSubmitAssociateDomain({
    modalType: ASSOCIATE_DOMAIN_MODAL_TYPE.EDIT,
    onClose,
    defaultDomain,
  });

  return (
    <ModalAssociateDomainController
      modalType={ASSOCIATE_DOMAIN_MODAL_TYPE.EDIT}
      title={t('orgSettings.editADomain')}
      defaultDomain={defaultDomain}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      submitLabel={t('common.save')}
      closeDialog={onClose}
    />
  );
};

EditAddDomain.propTypes = {
  onClose: PropTypes.func.isRequired,
  defaultDomain: PropTypes.string,
};

EditAddDomain.defaultProps = {
  defaultDomain: '',
};

export default EditAddDomain;
