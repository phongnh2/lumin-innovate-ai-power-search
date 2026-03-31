import MuiMenuList, { MenuListProps } from '@mui/material/MenuList';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';

import { MenuContext } from './MenuContext';

import * as Styled from './Menu.styled';

interface MenuProps extends MenuListProps {
  alignMenuItems?: 'top' | 'center' | 'bottom';
}

const Menu = React.forwardRef<HTMLUListElement, MenuProps>((props, ref) => {
  const { alignMenuItems = 'center', ...otherProps } = props;
  const theme = useTheme() as Record<string, string>;
  const classes = Styled.useMenuStyle({ theme });

  const context = useMemo(
    () => ({
      alignMenuItems,
    }),
    [alignMenuItems]
  );

  return (
    <MenuContext.Provider value={context}>
      <MuiMenuList ref={ref} classes={classes} {...otherProps} />
    </MenuContext.Provider>
  );
});

export default Menu;
