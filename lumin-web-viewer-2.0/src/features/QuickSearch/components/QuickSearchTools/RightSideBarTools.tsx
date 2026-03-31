import { TFunction } from 'i18next';
import React from 'react';

import AiAssistantMenuItem from '@new-ui/components/AiAssistantMenuItem';
import CommentHistoryMenuItem from '@new-ui/components/CommentHistoryMenuItem';
import PrintBtn from '@new-ui/components/LuminRightSideBar/components/PrintBtn';
import SignInRequiredProvider from '@new-ui/components/LuminRightSideBar/components/SignInRequiredProvider';

import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

export const getRightSideBarTools = (
  t: TFunction,
  { isDisabledPrint }: { isDisabledPrint: boolean }
): QuickSearchToolType[] => [
  {
    key: QUICK_SEARCH_TOOLS.AI_ASSISTANT,
    title: t('common.aiAssistant'),
    element: <AiAssistantMenuItem />,
  },
  {
    key: QUICK_SEARCH_TOOLS.COMMENT_HISTORY,
    title: t('common.commentsHistory'),
    element: <CommentHistoryMenuItem />,
  },
  {
    key: QUICK_SEARCH_TOOLS.PRINT,
    title: t('common.print'),
    element: (
      <SignInRequiredProvider
        render={({ validate }) => (
          <PrintBtn
            toolValidateCallback={validate}
            renderAsMenuItem
            disabled={isDisabledPrint}
            tooltipContent={isDisabledPrint ? t('shareSettings.permissionDenied') : undefined}
          />
        )}
      />
    ),
  },
];
