import React from 'react';

import core from 'core';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks/useTranslation';

import { getShortcut } from '../../utils';
import UndoRedoEditTextProvider from '../UndoRedoEditTextProvider';

const RedoEditTextTool = () => {
  const { t } = useTranslation();
  const onClick = async () => {
    await core.docViewer.getContentEditHistoryManager().redo();
  };
  return (
    <UndoRedoEditTextProvider>
      {({ canRedo }) => (
        <SingleButton
          icon="md_redo"
          iconSize={24}
          onClick={onClick}
          tooltipData={{
            location: 'bottom',
            title: t('annotation.redo'),
            shortcut: getShortcut('redo'),
          }}
          disabled={!canRedo}
        />
      )}
    </UndoRedoEditTextProvider>
  );
};

export default RedoEditTextTool;
