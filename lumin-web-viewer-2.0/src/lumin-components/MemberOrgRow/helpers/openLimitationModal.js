import { t } from 'i18next';
import React from 'react';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_MAX_MEMBERS, ORGANIZATION_TEXT } from 'constants/organizationConstants';
import { STATIC_PAGE_URL } from 'constants/urls';

export const openLimitedOrgMembersModal = ({ openModal, orgName }) => {
  openModal({
    type: ModalTypes.WARNING,
    title: 'Unable to accept members',
    message: (
      <>
        <b>{orgName}</b> {ORGANIZATION_TEXT} already has {ORGANIZATION_MAX_MEMBERS} members. {' '}
        Please contact us to accept more requesters.
      </>
    ),
    cancelButtonTitle: 'Cancel',
    confirmButtonTitle: 'Contact Sales',
    onCancel: () => {},
    onConfirm: () => window.open(STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale'))),
  });
};
