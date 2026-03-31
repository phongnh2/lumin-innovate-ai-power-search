import { t } from 'i18next';

import { executeCopyText } from 'luminComponents/RightSideBarContent/utils';

import { toastUtils } from 'utils';

import { Routers } from 'constants/Routers';

export const handleCopyTemplateLink = async (templateId: string) => {
  const templateLink = `${window.location.origin}${Routers.TEMPLATE}/${templateId}`;
  await executeCopyText(templateLink);
  toastUtils.success({ message: t('modalShare.hasBeenCopied') });
};

export const getTemplateLink = (templateId: string) => `${Routers.TEMPLATE}/${templateId}`;
