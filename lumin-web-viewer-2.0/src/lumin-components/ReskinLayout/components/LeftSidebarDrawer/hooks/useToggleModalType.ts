import { useCallback, useState } from 'react';

import { Nullable } from 'interfaces/common';

import { ModalTypes } from '../LeftSidebarDrawer.constants';

type UseToggleModalTypeData = {
  modalType: Nullable<ModalTypes>;
  toggleModalType: (type: Nullable<ModalTypes>) => void;
};

const useToggleModalType = (): UseToggleModalTypeData => {
  const [modalType, setModalType] = useState<Nullable<ModalTypes>>(null);

  const toggleModalType = useCallback((type: Nullable<ModalTypes>) => {
    setModalType(type);
  }, []);

  return { modalType, toggleModalType };
};

export default useToggleModalType;
