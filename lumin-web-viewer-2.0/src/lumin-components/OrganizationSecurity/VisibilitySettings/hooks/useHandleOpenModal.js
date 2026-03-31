import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import useHandleSubmitAssociateDomain from 'lumin-components/ModalAssociateDomain/hook/useHandleSubmitAssociateDomain';

import { useEnableWebReskin, useOpenUpgradeRequiredModal, useTranslation } from 'hooks';

import { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';
import { PaymentUrlSerializer } from 'utils/payment';

import { ASSOCIATE_DOMAIN_MODAL_TYPE, ModalTypes } from 'constants/lumin-common';
import { Plans } from 'constants/plan';
import { UrlSearchParam } from 'constants/UrlSearchParam';

const useHandleOpenModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isEnableReskin } = useEnableWebReskin();
  const { payment, _id } = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const [associateDomainModal, setAssociateDomainModal] = useState(null);
  const [defaultDomain, setDefaultDomain] = useState('');
  const { onSubmit } = useHandleSubmitAssociateDomain({ modalType: ASSOCIATE_DOMAIN_MODAL_TYPE.REMOVE });
  const { openModal } = useOpenUpgradeRequiredModal({
    modalName: ModalName.REQUEST_UPGRADE_TO_ADD_DOMAIN,
  });

  const { type } = payment || {};
  const isFreeOrg = type === Plans.FREE;

  const handleOpenAddModal = () => {
    const search = new URLSearchParams();
    search.append(UrlSearchParam.PAYMENT_ORG_TARGET, _id);
    if (isFreeOrg) {
      const urlSerializer = new PaymentUrlSerializer();
      const paymentUrl = urlSerializer.of(_id).returnUrlParam().pro;
      openModal(paymentUrl);
      return;
    }

    setAssociateDomainModal(ASSOCIATE_DOMAIN_MODAL_TYPE.ADD);
  };

  const handleOpenEditModal = (_domain) => {
    setAssociateDomainModal(ASSOCIATE_DOMAIN_MODAL_TYPE.EDIT);
    setDefaultDomain(_domain);
  };

  const handleConfirmDelete = async (_domain) => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    await onSubmit({ domain: _domain });
    return dispatch(actions.closeModal());
  };

  const handleOpenDeleteModal = (_domain) => {
    const modalData = {
      type: ModalTypes.WARNING,
      title: t('orgSettings.removeDomain'),
      message: (
        <span>
          <Trans
            i18nKey="orgSettings.messageRemoveDomain"
            components={{ b: <b className={isEnableReskin && 'kiwi-message--primary'} /> }}
            values={{ domain: _domain }}
          />
        </span>
      ),
      confirmButtonTitle: t('common.remove'),
      cancelButtonTitle: t('common.cancel'),
      onCancel: () => {},
      onConfirm: () => handleConfirmDelete(_domain),
      useReskinModal: true,
    };
    return dispatch(actions.openModal(modalData));
  };

  return {
    defaultDomain,
    associateDomainModal,
    setAssociateDomainModal,
    handleOpenAddModal,
    handleOpenEditModal,
    handleOpenDeleteModal,
  };
};

export { useHandleOpenModal };
