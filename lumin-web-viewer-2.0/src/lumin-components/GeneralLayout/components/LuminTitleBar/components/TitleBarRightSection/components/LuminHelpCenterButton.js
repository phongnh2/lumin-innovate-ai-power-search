import PropTypes from 'prop-types';
import React, { useState } from 'react';

import IconButton from '@new-ui/general-components/IconButton';
import Popper from '@new-ui/general-components/Popper';

import HelpCenterPopper from 'lumin-components/NavigationBar/components/HelpCenterPopper';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

const LuminHelpCenterButton = ({ disabled }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        active={open}
        icon="md_status_question"
        size="large"
        iconSize={24}
        disabled={disabled}
        onClick={handleClick}
        tooltipData={{ placement: 'bottom', title: open ? '' : t('common.helpCenter'), open }}
        data-cy="help_center_button"
        data-joyride-new-layout="step-3"
        data-lumin-btn-name={ButtonName.HELP}
      />

      {open && (
        <Popper open anchorEl={anchorEl} onClose={handleClose}>
          <HelpCenterPopper closePopper={handleClose} />
        </Popper>
      )}
    </>
  );
};

LuminHelpCenterButton.propTypes = {
  disabled: PropTypes.bool,
};
LuminHelpCenterButton.defaultProps = {
  disabled: false,
};

export default LuminHelpCenterButton;
