import { t } from 'i18next';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_TEXT } from 'constants/organizationConstants';
import { STATIC_PAGE_URL } from 'constants/urls';

export const openEnterpriseLimitationModal = ({
  openModal,
  maximumMembers,
}) => {
  const modalConfig = {
    type: ModalTypes.WARNING,
    title: 'Unable to accept members',
    message: `The maximum number of members for this ${ORGANIZATION_TEXT} is ${maximumMembers} member(s). 
    Please contact us to upgrade your plan and accept more requesters.`,
    confirmButtonTitle: 'Contact Sales',
    onCancel: () => {},
    onConfirm: () => window.open(STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale'))),
  };
  openModal(modalConfig);
};
