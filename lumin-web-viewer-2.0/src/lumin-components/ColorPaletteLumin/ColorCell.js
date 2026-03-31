import Button from '@mui/material/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const CellButton = styled(Button)`
  &[data-active='true'] {
    outline: 1px solid ${({ theme }) => theme.le_main_on_surface};
    outline-offset: 2px;
  }
`;

const ColorCell = ({ bg, onClick, className, active }) => (
  <CellButton
    key={bg}
    data-active={active}
    onClick={onClick}
    value={bg}
    className={classNames([
      'cell',
      {
        bordered: bg === 'rgb(255, 255, 255)',
      },
      className,
    ])}
    style={{ backgroundColor: bg }}
    data-cy="color_cell_button"
  />
);

ColorCell.propTypes = {
  bg: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  /**
   * @description new layout prop
   */
  active: PropTypes.bool,
};

ColorCell.defaultProps = {
  bg: '',
  className: '',
  onClick: () => {},
  active: false,
};

export default ColorCell;
