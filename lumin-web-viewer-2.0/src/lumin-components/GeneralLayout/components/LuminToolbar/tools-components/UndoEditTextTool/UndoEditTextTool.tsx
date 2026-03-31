import React from 'react';

import core from 'core';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks/useTranslation';

import { getShortcut } from '../../utils';
import UndoRedoEditTextProvider from '../UndoRedoEditTextProvider';

const UndoEditTextTool = () => {
  const { t } = useTranslation();
  const onClick = async () => {
    await core.docViewer.getContentEditHistoryManager().undo();
  };

  return (
    <UndoRedoEditTextProvider>
      {({ canUndo }) => (
        <SingleButton
          icon="md_undo"
          iconSize={24}
          onClick={onClick}
          tooltipData={{
            location: 'bottom',
            title: t('annotation.undo'),
            shortcut: getShortcut('undo'),
          }}
          disabled={!canUndo}
        />
      )}
    </UndoRedoEditTextProvider>
  );
};

export default UndoEditTextTool;
