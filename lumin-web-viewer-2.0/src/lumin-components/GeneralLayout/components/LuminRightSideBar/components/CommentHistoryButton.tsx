import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { LayoutElements } from '@new-ui/constants';
import LegacyIconButton from '@new-ui/general-components/IconButton';

import { useTranslation } from 'hooks/useTranslation';

import { MessageName } from 'utils/Factory/EventCollection/RightBarEventCollection';

import { useToggleRightSideBarTool } from '../hooks/useToggleRightSideBarTool';

const CommentHistoryButton = () => {
  const { t } = useTranslation();
  const { isActiveCommentHistoryButton, enabledRightSideBarTool, onChangeLayout } = useToggleRightSideBarTool();

  return (
    <PlainTooltip content={t('common.commentsHistory')} position="left">
      <LegacyIconButton
        iconSize={24}
        size="large"
        icon="md_comment_history"
        disabled={!enabledRightSideBarTool}
        active={isActiveCommentHistoryButton}
        data-lumin-btn-name={MessageName.COMMENT_HISTORY}
        onClick={() => onChangeLayout(LayoutElements.NOTE_HISTORY)}
      />
    </PlainTooltip>
  );
};

export default CommentHistoryButton;
