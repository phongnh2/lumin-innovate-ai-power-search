import React, { useMemo } from 'react';

import { OutlineTreeContext } from '../../contexts';
import { useOutlineTreeHandler } from '../../hooks/useOutlineTreeHandler';

interface OutlineTreeProviderProps {
  children: React.ReactNode;
}

const OutlineTreeProvider = ({ children }: OutlineTreeProviderProps) => {
  const {
    addOutline,
    modifyOutline,
    removeOutline,
    activeOutlinePath,
    setActiveOutlinePath,
    outlines,
    moveOutlineBeforeTarget,
    moveOutlineAfterTarget,
    moveOutlineInward,
    requestAccessModalElement,
    defaultOutline,
    setDefaultOutline,
  } = useOutlineTreeHandler();
  const outlineTreeContext = useMemo(
    () => ({
      addOutline,
      modifyOutline,
      removeOutline,
      activeOutlinePath,
      setActiveOutlinePath,
      lastRootOutline: outlines[outlines.length - 1]?.pathId,
      outlines,
      moveOutlineBeforeTarget,
      moveOutlineAfterTarget,
      moveOutlineInward,
      requestAccessModalElement,
      defaultOutline,
      setDefaultOutline,
    }),
    [
      addOutline,
      modifyOutline,
      removeOutline,
      activeOutlinePath,
      setActiveOutlinePath,
      outlines,
      moveOutlineBeforeTarget,
      moveOutlineAfterTarget,
      moveOutlineInward,
      requestAccessModalElement,
      defaultOutline,
      setDefaultOutline,
    ]
  );

  return <OutlineTreeContext.Provider value={outlineTreeContext}>{children}</OutlineTreeContext.Provider>;
};

export default OutlineTreeProvider;
