import { ChatsIcon } from '@luminpdf/icons/dist/csr/Chats';
import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { LayoutElements } from '@new-ui/constants';

import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';
import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';

import { MessageName } from 'utils/Factory/EventCollection/RightBarEventCollection';

import { useToggleRightSideBarTool } from '../LuminRightSideBar/hooks/useToggleRightSideBarTool';

const CommentHistoryMenuItem = () => {
  const { t } = useTranslation();
  const { isActiveCommentHistoryButton, enabledRightSideBarTool, onChangeLayout, onEnableRightSidebarTools } =
    useToggleRightSideBarTool();

  const onClickMenuItem = () => {
    if (!enabledRightSideBarTool) {
      onEnableRightSidebarTools();
    }
    onChangeLayout(LayoutElements.NOTE_HISTORY);
  };

  return (
    <MenuItem
      activated={isActiveCommentHistoryButton}
      data-lumin-btn-name={MessageName.COMMENT_HISTORY}
      leftSection={<ChatsIcon weight="light" size={24} />}
      onClick={withExitFormBuildChecking(
        handlePromptCallback({
          callback: onClickMenuItem,
        })
      )}
    >
      {t('common.commentsHistory')}
    </MenuItem>
  );
};

export default CommentHistoryMenuItem;
