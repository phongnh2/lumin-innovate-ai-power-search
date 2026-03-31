import { useState, useCallback } from 'react';

type UseToggleCollapseData = {
  isCollapsed: boolean;
  toggleCollapse: (value?: boolean) => void;
};

const useToggleCollapse = (): UseToggleCollapseData => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = useCallback((value?: boolean) => {
    setIsCollapsed(typeof value === 'boolean' ? value : (prevState) => !prevState);
  }, []);

  return {
    isCollapsed,
    toggleCollapse,
  };
};

export default useToggleCollapse;
