import PropTypes from 'prop-types';
import React from 'react';

import { LazyContentDialog } from 'lumin-components/Dialog';

import { useEnableWebReskin } from 'hooks';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import ModalSkeleton from './components/ModalSkeleton';

import * as Styled from './ModalFolder.styled';

FolderController.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

function FolderController({ title, onClose, ...rest }) {
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return <FolderControllerContent onClose={onClose} isEnableReskin={isEnableReskin} title={title} {...rest} />;
  }

  return (
    <LazyContentDialog open title={<Styled.Title>{title}</Styled.Title>} fallback={<ModalSkeleton />} onClose={onClose}>
      <FolderControllerContent onClose={onClose} isEnableReskin={isEnableReskin} {...rest} />
    </LazyContentDialog>
  );
}

export const FolderControllerContent = lazyWithRetry(() => import('./FolderControllerContent'));

export default FolderController;
