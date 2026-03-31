import { createContext, useContext } from 'react';

export const MenuContext = createContext({
  alignMenuItems: 'center' as 'top' | 'center' | 'bottom',
});

export const useMenuContext = () => useContext(MenuContext);
