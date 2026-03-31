import { useEffect } from 'react';

const useEnterToSelectNode = () => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') {
        return;
      }
      const role = document.activeElement?.getAttribute('role');
      if (role !== 'treeitem') {
        return;
      }
      const nodeElement = (document.activeElement as HTMLLIElement).querySelector('[data-tree-node="true"]');
      (nodeElement as HTMLDivElement)?.click();
    };
    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
};

export default useEnterToSelectNode;
