import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';

import { useTranslation } from 'hooks/useTranslation';

// eslint-disable-next-line import/no-cycle, import/no-named-as-default
import withConfirmDeleteModal from '../../withConfirmDeleteModal';

export const Remove = ({ handleOpen, disabled, disabledReason }) => {
  const { t } = useTranslation();
  const isDisabled = disabled || core.getContentEditManager().isInContentEditMode();

  const menuItem = (
    <MenuItem onClick={handleOpen} icon="md_trash" disabled={isDisabled}>
      {t('common.delete')}
    </MenuItem>
  );

  if (disabledReason) {
    return (
      <PlainTooltip content={disabledReason}>
        <span>{menuItem}</span>
      </PlainTooltip>
    );
  }

  return menuItem;
};

Remove.propTypes = {
  handleOpen: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  disabledReason: PropTypes.string,
};

Remove.defaultProps = {
  disabledReason: '',
};

export default withConfirmDeleteModal(Remove);
