import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks/useTranslation';

import withConfirmDeleteModal from '../../withConfirmDeleteModal';

export const Remove = ({ handleOpen, disabled, disabledReason }) => {
  const { t } = useTranslation();
  const tooltipTitle = disabledReason || t('common.deletePage');

  return (
    <IconButton
      className="menu-btn"
      icon="md_trash"
      iconSize={24}
      tooltipData={{ location: 'bottom', title: tooltipTitle }}
      onClick={handleOpen}
      disabled={disabled}
    />
  );
};

Remove.propTypes = {
  handleOpen: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  disabledReason: PropTypes.string,
};

Remove.defaultProps = {
  disabledReason: '',
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default withConfirmDeleteModal(connect(mapStateToProps, mapDispatchToProps)(Remove), true);
