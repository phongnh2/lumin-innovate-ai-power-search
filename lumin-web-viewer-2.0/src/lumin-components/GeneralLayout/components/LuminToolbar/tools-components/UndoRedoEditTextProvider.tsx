import { useEffect, useState } from 'react';

import core from 'core';

interface UndoRedoEditTextProviderProps {
  children: ({ canUndo, canRedo }: { canUndo: boolean; canRedo: boolean }) => JSX.Element;
}

const UndoRedoEditTextProvider = ({ children }: UndoRedoEditTextProviderProps) => {
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(true);

  useEffect(() => {
    const onUndoRedoUpdated = () => {
      setCanUndo(core.docViewer.getContentEditHistoryManager().canUndo());
      setCanRedo(core.docViewer.getContentEditHistoryManager().canRedo());
    };

    Core.ContentEdit.addEventListener('textContentUpdated', onUndoRedoUpdated);
    return () => {
      Core.ContentEdit.removeEventListener('textContentUpdated', onUndoRedoUpdated);
    };
  }, []);

  return children({
    canUndo,
    canRedo,
  });
};

export default UndoRedoEditTextProvider;
