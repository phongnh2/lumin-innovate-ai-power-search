import { ChatCenteredTextIcon } from '@luminpdf/icons/dist/csr/ChatCenteredText';
import { ChatsCircleIcon } from '@luminpdf/icons/dist/csr/ChatsCircle';
import { QuestionIcon } from '@luminpdf/icons/dist/csr/Question';
import { TFunction } from 'i18next';
import { Icomoon, MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { HELP_CENTER_TOOLS } from 'features/QuickSearch/constants/helpCenterTools';
import { QuickSearchToolType } from 'features/QuickSearch/types';

import { HELP_CENTER_URL } from 'constants/customConstant';
import { AUTH_SERVICE_URL, CANNY_FEEDBACK_REDIRECT_URL, STATIC_PAGE_URL } from 'constants/urls';

const getHelpCenterToolsConfiguration = (t: TFunction) => [
  {
    key: HELP_CENTER_TOOLS.HELP_CENTER,
    icon: <QuestionIcon size={24} />,
    title: t('common.helpCenter'),
    url: HELP_CENTER_URL,
  },
  {
    key: HELP_CENTER_TOOLS.CONTACT_SUPPORT,
    icon: <ChatsCircleIcon size={24} />,
    title: t('common.contactSupport'),
    url: STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport')),
  },
  {
    key: HELP_CENTER_TOOLS.GIVE_FEEDBACK,
    icon: <ChatCenteredTextIcon size={24} />,
    title: t('common.giveFeedback'),
    url: `${AUTH_SERVICE_URL}/authentication/canny?redirect=${CANNY_FEEDBACK_REDIRECT_URL}`,
  },
];

export const getHelpCenterTools = (t: TFunction): QuickSearchToolType[] => {
  const helpCenterTools = getHelpCenterToolsConfiguration(t);

  return helpCenterTools.map(({ key, title, url, icon }) => ({
    key,
    title,
    element: (
      <MenuItem
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        leftSection={icon}
        rightSection={
          <Icomoon type="external-link-sm" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)" />
        }
      >
        {title}
      </MenuItem>
    ),
  }));
};
