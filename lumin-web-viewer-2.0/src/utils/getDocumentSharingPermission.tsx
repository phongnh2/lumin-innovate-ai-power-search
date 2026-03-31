import { ChatCircleTextIcon } from '@luminpdf/icons/dist/csr/ChatCircleText';
import { EyeIcon } from '@luminpdf/icons/dist/csr/Eye';
import { LinkSimpleIcon } from '@luminpdf/icons/dist/csr/LinkSimple';
import { PencilSimpleIcon } from '@luminpdf/icons/dist/csr/PencilSimple';
import { TFunction } from 'i18next';
import React from 'react';

import { DocumentRole } from 'constants/documentConstants';

const getDocumentSharingPermission = (t: TFunction) => ({
  [DocumentRole.SPECTATOR]: {
    icon: <EyeIcon height={20} width={20} />,
    text: t('sharePermission.canView'),
    role: DocumentRole.SPECTATOR,
  },
  [DocumentRole.VIEWER]: {
    icon: <ChatCircleTextIcon height={20} width={20} />,
    text: t('sharePermission.canComment'),
    role: DocumentRole.VIEWER,
  },
  [DocumentRole.EDITOR]: {
    icon: <PencilSimpleIcon height={20} width={20} />,
    text: t('sharePermission.canEdit'),
    role: DocumentRole.EDITOR,
  },
  [DocumentRole.SHARER]: {
    icon: <LinkSimpleIcon height={20} width={20} />,
    text: t('sharePermission.canShare'),
    role: DocumentRole.SHARER,
  },
});

export default getDocumentSharingPermission;
