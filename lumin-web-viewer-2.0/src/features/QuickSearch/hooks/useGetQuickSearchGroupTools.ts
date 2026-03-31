import latinize from 'latinize';
import { useSelector } from 'react-redux';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';

import selectors from 'selectors';

import { useDocumentExportPermission } from 'hooks/useDocumentExportPermission';
import { useThemeMode } from 'hooks/useThemeMode';
import { useTranslation } from 'hooks/useTranslation';

import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';
import { usePasswordManagerPermission } from 'features/PasswordProtection';

import { THEME_MODE } from 'constants/lumin-common';

import {
  AgreementGenTool,
  getFileMenuTools,
  getAnnotateTools,
  getSecurityTools,
  getFillAndSignTools,
  getPageTools,
  getAiTools,
  getEditPdfTools,
  getRightSideBarTools,
  getHelpCenterTools,
  getLeftToolbarTools,
  getRemainingTools,
} from '../components/QuickSearchTools';
import { QUICK_SEARCH_GROUP_KEY } from '../constants';
import { QuickSearchGroupToolType } from '../types';

export const useGetQuickSearchGroupTools = () => {
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const toolbarValue = useSelector(selectors.toolbarValue);
  const { enabled: enabledChatbot } = useEnabledChatBot();
  const { canChange: canChangePassword } = usePasswordManagerPermission();
  const { isDisabledPrint } = useDocumentExportPermission();

  const QUICK_SEARCH_GROUP_TOOLS: QuickSearchGroupToolType[] = [
    {
      key: QUICK_SEARCH_GROUP_KEY.AGREEMENT_GEN,
      label: t('viewer.editInAgreementGen.sectionTitle'),
      tools: AgreementGenTool,
    },
    enabledChatbot && {
      key: QUICK_SEARCH_GROUP_KEY.LUMIN_AI,
      label: t('viewer.leftSidebar.luminAi'),
      tools: getAiTools(t),
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.ANNOTATE,
      label: t('viewer.leftSidebar.annotate'),
      tools: getAnnotateTools(t),
      toolbarValue: LEFT_SIDE_BAR.ANNOTATION,
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.SECURITY,
      label: t('common.security'),
      tools: getSecurityTools({ t, canChangePassword }),
      toolbarValue: LEFT_SIDE_BAR.SECURITY,
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.FILL_AND_SIGN,
      label: t('viewer.leftSidebar.fillAndSign'),
      tools: getFillAndSignTools(t),
      toolbarValue: LEFT_SIDE_BAR.FILL_AND_SIGN,
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.EDIT_PDF,
      label: t('viewer.leftSidebar.editPDF'),
      tools: getEditPdfTools(t),
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.PAGE_TOOLS,
      label: t('viewer.leftSidebar.pageTools'),
      tools: getPageTools(t),
      toolbarValue: LEFT_SIDE_BAR.PAGE_TOOLS,
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.FILE_MENU_TOOLS,
      label: t('common.other'),
      tools: getFileMenuTools({ t, isLightMode: themeMode === THEME_MODE.LIGHT }),
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.RIGHT_SIDE_BAR_TOOLS,
      label: null,
      tools: getRightSideBarTools(t, { isDisabledPrint }),
      /**
       * some tools only visible when searching, and hidden in default list view.
       */
      onlyVisibleOnSearch: true,
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.HELP_CENTER_TOOLS,
      label: null,
      tools: getHelpCenterTools(t),
      onlyVisibleOnSearch: true,
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.LEFT_TOOLBAR_TOOLS,
      label: null,
      tools: getLeftToolbarTools({ t, toolbarValue }),
      onlyVisibleOnSearch: true,
    },
    {
      key: QUICK_SEARCH_GROUP_KEY.REMAINING_TOOLS,
      label: null,
      tools: getRemainingTools(t),
      onlyVisibleOnSearch: true,
    },
  ].filter(Boolean);

  const ALL_QUICK_SEARCH_NORMALIZED_TOOLS_TITLE = QUICK_SEARCH_GROUP_TOOLS.filter(Boolean).flatMap((group) =>
    group.tools.map((tool) => ({
      ...tool,
      fuseTitle: latinize(tool.title),
      fuseTokens: latinize(tool.title).split(' '),
    }))
  );

  return { QUICK_SEARCH_GROUP_TOOLS, ALL_QUICK_SEARCH_NORMALIZED_TOOLS_TITLE };
};
