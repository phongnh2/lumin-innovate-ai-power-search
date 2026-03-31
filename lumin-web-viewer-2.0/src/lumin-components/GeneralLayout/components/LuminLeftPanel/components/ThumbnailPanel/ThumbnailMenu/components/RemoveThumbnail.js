import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import core from 'core';

import { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';

import { useTranslation } from 'hooks';

import usePagetoolActionFromThumbnail from '../../hooks/usePagetoolActionFromThumbnail';
import { ThumbnailMenuContext } from '../ThumbnailMenu';

export const RemoveThumbnail = ({ disabled }) => {
  const { t } = useTranslation();
  const isDisabled = disabled || core.getContentEditManager().isInContentEditMode();
  const { handleClose, index } = useContext(ThumbnailMenuContext);
  const { removePage } = usePagetoolActionFromThumbnail();
  const onClickDelete = async () => {
    const callback = () => {
      core.setCurrentPage(index + 1);
      handleClose();
    };
    await removePage({ page: index + 1, callback });
  };
  return (
    <MenuItem
      onClick={onClickDelete}
      icon="md_trash"
      disabled={isDisabled}
    >
      {t('common.delete')}
    </MenuItem>
  );
};

RemoveThumbnail.propTypes = {
  disabled: PropTypes.bool.isRequired,
};

export default RemoveThumbnail;
