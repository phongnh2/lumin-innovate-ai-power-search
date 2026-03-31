import { useCallback, useState } from 'react';

import { Nullable } from 'interfaces/common';

import { SubMenuTypes } from '../LeftSidebarDrawer.constants';

type UseToggleSubMenuData = {
  subMenu: Nullable<SubMenuTypes>;
  toggleSubMenu: (type: Nullable<SubMenuTypes>) => void;
};

const useToggleSubMenu = (): UseToggleSubMenuData => {
  const [subMenu, setSubMenu] = useState<Nullable<SubMenuTypes>>(null);

  const toggleSubMenu = useCallback((type: Nullable<SubMenuTypes>) => {
    setSubMenu(type);
  }, []);

  return { subMenu, toggleSubMenu };
};

export default useToggleSubMenu;
