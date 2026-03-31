import React from 'react';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useOpenReactivateModal } from 'features/CNC/hooks';

import { IOrganization } from 'interfaces/organization/organization.interface';

const ReactivateModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ './ReactivateModal'));

const ReactivateModalWrapper = ({ organization }: { organization: IOrganization }) => {
  const { open, onClose } = useOpenReactivateModal();

  return open && <ReactivateModal currentOrganization={organization} onClose={onClose} />;
};

export default ReactivateModalWrapper;
