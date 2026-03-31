import { MenuList } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from 'styled-components';

import MenuItem from 'lumin-components/Shared/MenuItem';
import Tooltip from 'luminComponents/Shared/Tooltip';

import * as Styled from '../Tabs.styled';

const TabPopover = ({ closePopper, list, activeItem, setActiveItem }) => {
  const theme = useTheme();
  const classes = Styled.useStyle({ theme });

  const handleClick = (item) => {
    item.onClick();
    setActiveItem({
      value: item.value,
      label: item.label,
    });
    closePopper();
  };

  return (
    <MenuList classes={{ root: classes.menuList }}>
      {list.map((item, index) => activeItem.value !== item.value && (
        <Tooltip
          key={index}
          title={item.tooltip || ''}
          placement="top"
        >
          <div>
            <MenuItem onClick={() => handleClick(item)}>
              <Styled.PopoverText>
                {item.label}
              </Styled.PopoverText>
            </MenuItem>
          </div>
        </Tooltip>
      ))}
    </MenuList>
  );
};

TabPopover.propTypes = {
  closePopper: PropTypes.func,
  list: PropTypes.array,
  activeItem: PropTypes.object,
  setActiveItem: PropTypes.func,
};

TabPopover.defaultProps = {
  closePopper: () => {},
  list: [],
  activeItem: {},
  setActiveItem: () => {},
};

export default TabPopover;