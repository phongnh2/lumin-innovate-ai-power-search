import i18next from 'i18next';
import { useMemo, useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';
import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';

import { organizationServices } from 'services';

import { toastUtils, errorUtils } from 'utils';
import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { OrganizationUtilities } from 'utils/Factory/Organization';

import { ErrorCode } from 'constants/errorCode';
import { ASSOCIATE_DOMAIN_MODAL_TYPE } from 'constants/lumin-common';
import {
  ERROR_MESSAGE_ORG,
  getAssociateDomainNotExistMemberError,
  getAssociateDomainPopularDomain,
} from 'constants/messages';

const ERROR_MESSAGE_ASSOCIATE_DOMAIN = {
  [ErrorCode.Org.INVALID_ASSOCIATE_DOMAIN_NOT_EXIST_MEMBER]: (isAddModal) =>
    getAssociateDomainNotExistMemberError(isAddModal ? 'added' : 'edited'),
  [ErrorCode.Org.INVALID_ASSOCIATE_DOMAIN_POPULAR_DOMAIN]: (isAddModal) =>
    getAssociateDomainPopularDomain(isAddModal ? 'add' : 'edit'),
  [ErrorCode.Org.INVALID_ASSOCIATE_DOMAIN_USE_BY_ANOTHER_CIRCLE]: () =>
    i18next.t(ERROR_MESSAGE_ORG.INVALID_ASSOCIATE_DOMAIN_USE_BY_ANOTHER_CIRCLE),
};

const useHandleSubmitAssociateDomain = ({ modalType, onClose, defaultDomain }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data;
  const { _id: orgId } = currentOrganization;
  const isAddModal = modalType === ASSOCIATE_DOMAIN_MODAL_TYPE.ADD;
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });
  const { trackModalConfirmation } = useTrackingModalEvent({
    modalName: ModalName.ADD_DOMAIN,
    modalPurpose: ModalPurpose[ModalName.ADD_DOMAIN],
  });

  const ASSOCIATE_DOMAIN_SERVICE = useMemo(
    () => ({
      [ASSOCIATE_DOMAIN_MODAL_TYPE.ADD]: {
        service: organizationServices.addAssociateDomain,
        message: t('orgSettings.domainHasBeenAdded'),
      },
      [ASSOCIATE_DOMAIN_MODAL_TYPE.EDIT]: {
        service: organizationServices.editAssociateDomain,
        message: t('orgSettings.domainHasBeenUpdated'),
      },
      [ASSOCIATE_DOMAIN_MODAL_TYPE.REMOVE]: {
        service: organizationServices.removeAssociateDomain,
        message: t('orgSettings.domainHasBeenRemoved'),
      },
    }),
    [t]
  );

  const handleErrorAddAssociateDomain = (err) => {
    const { code: errorCode } = errorUtils.extractGqlError(err);
    const getErrorMessage = ERROR_MESSAGE_ASSOCIATE_DOMAIN[errorCode];
    const errMessage = getErrorMessage(isAddModal);

    if (errMessage) {
      setErrorMessage(errMessage);
      return;
    }

    toastUtils.openUnknownErrorToast();
  };

  const getService = (domain) => {
    switch (modalType) {
      case ASSOCIATE_DOMAIN_MODAL_TYPE.ADD:
      case ASSOCIATE_DOMAIN_MODAL_TYPE.REMOVE:
        return ASSOCIATE_DOMAIN_SERVICE[modalType].service({ orgId, associateDomain: domain });
      case ASSOCIATE_DOMAIN_MODAL_TYPE.EDIT:
        return ASSOCIATE_DOMAIN_SERVICE[modalType].service({
          orgId,
          newAssociateDomain: domain,
          oldAssociateDomain: defaultDomain,
        });
      default:
        return null;
    }
  };

  const onSubmit = async ({ domain }) => {
    try {
      const organization = await getService(domain);
      dispatch(actions.updateCurrentOrganization(organization));
      toastUtils.success({ message: ASSOCIATE_DOMAIN_SERVICE[modalType].message });
      onClose && onClose();
    } catch (err) {
      handleErrorAddAssociateDomain(err);
    }
  };

  const beforeSubmit = ({ domain }) => {
    const isAddedDomain = orgUtilities.domainList().includes(domain);

    if (modalType === ASSOCIATE_DOMAIN_MODAL_TYPE.ADD) {
      trackModalConfirmation();
    }

    if (isAddedDomain && modalType !== ASSOCIATE_DOMAIN_MODAL_TYPE.REMOVE) {
      return setErrorMessage(t(ERROR_MESSAGE_ORG.DOMAIN_ALREADY_ADDED));
    }

    return onSubmit({ domain });
  };

  return { errorMessage, onSubmit: beforeSubmit };
};

export default useHandleSubmitAssociateDomain;
