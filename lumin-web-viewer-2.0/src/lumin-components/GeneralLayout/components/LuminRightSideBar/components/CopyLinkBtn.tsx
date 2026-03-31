import { IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import selectors from 'selectors';

import { shouldShowShareDocumentAndCopyLinkTool } from 'lumin-components/RightSideBar/helper/checkValid';
import { executeCopyText } from 'lumin-components/RightSideBarContent/utils';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { getShareLink, toastUtils } from 'utils';
import messageEvent, { MessageName } from 'utils/Factory/EventCollection/RightBarEventCollection';

const CopyLinkBtn = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { t } = useTranslation();

  if (!shouldShowShareDocumentAndCopyLinkTool(currentDocument)) {
    return null;
  }

  const onCopyShareLink = async () => {
    await executeCopyText(getShareLink(currentDocument._id));
    toastUtils.success({ message: t('modalShare.hasBeenCopied') });
    messageEvent.clicked(MessageName.COPY_DOCUMENT_LINK);
  };

  return (
    <PlainTooltip content={t('modalShare.copyLink')} position="left">
      <IconButton icon="ph-link-simple" size="lg" onClick={onCopyShareLink} />
    </PlainTooltip>
  );
};

export default CopyLinkBtn;
