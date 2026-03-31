import React from 'react';
import PropTypes from 'prop-types';

import { ASSOCIATE_DOMAIN_MODAL_TYPE } from 'constants/lumin-common';
import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';
import { useTranslation } from 'hooks';

import useHandleSubmitAssociateDomain from './hook/useHandleSubmitAssociateDomain';
import ModalAssociateDomainController from './ModalAssociateDomainController';

const AddDomain = ({ onClose }) => {
  const { t } = useTranslation();
  const { errorMessage, onSubmit } = useHandleSubmitAssociateDomain({
    modalType: ASSOCIATE_DOMAIN_MODAL_TYPE.ADD,
    onClose,
  });
  const { trackModalDismiss } = useTrackingModalEvent({
    modalName: ModalName.ADD_DOMAIN,
    modalPurpose: ModalPurpose[ModalName.ADD_DOMAIN],
  });

  const onCloseModal = () => {
    trackModalDismiss();
    onClose();
  };

  return (
    <ModalAssociateDomainController
      modalType={ASSOCIATE_DOMAIN_MODAL_TYPE.ADD}
      title={t('orgSettings.addADomain')}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      submitLabel={t('common.add')}
      closeDialog={onCloseModal}
    />
  );
};

AddDomain.propTypes = {
  onClose: PropTypes.func.isRequired,
};

AddDomain.defaultProps = {
};

export default AddDomain;
