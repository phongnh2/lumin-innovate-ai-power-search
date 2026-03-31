import { ChatCircleTextIcon } from '@luminpdf/icons/dist/csr/ChatCircleText';
import { GlobeIcon } from '@luminpdf/icons/dist/csr/Globe';
import { PencilSimpleIcon } from '@luminpdf/icons/dist/csr/PencilSimple';
import { Icon as IconType } from '@luminpdf/icons/dist/lib/types';

import { DOCUMENT_LINK_TYPE, DOCUMENT_ROLES } from 'constants/lumin-common';

export const DocumentActionPermissionPrinciple = {
  ANYONE: DOCUMENT_LINK_TYPE.ANYONE,
  EDITOR: DOCUMENT_ROLES.EDITOR,
  SHARER: DOCUMENT_ROLES.SHARER,
  VIEWER: DOCUMENT_ROLES.VIEWER,
  SPECTATOR: DOCUMENT_ROLES.SPECTATOR,
} as const;

export const PrincipleCompoundKey = {
  ANYONE: 'ANYONE',
  SHARERS_AND_EDITORS: 'SHARERS_AND_EDITORS',
  SHARERS_EDITORS_AND_COMMENTERS: 'SHARERS_EDITORS_AND_COMMENTERS',
} as const;

export const PERMISSION_ROLES: Record<string, { Icon: IconType; value: string[] }> = {
  [PrincipleCompoundKey.ANYONE]: {
    Icon: GlobeIcon,
    value: [DocumentActionPermissionPrinciple.ANYONE],
  },
  [PrincipleCompoundKey.SHARERS_AND_EDITORS]: {
    Icon: PencilSimpleIcon,
    value: [DocumentActionPermissionPrinciple.SHARER, DocumentActionPermissionPrinciple.EDITOR],
  },
  [PrincipleCompoundKey.SHARERS_EDITORS_AND_COMMENTERS]: {
    Icon: ChatCircleTextIcon,
    value: [
      DocumentActionPermissionPrinciple.SHARER,
      DocumentActionPermissionPrinciple.EDITOR,
      DocumentActionPermissionPrinciple.VIEWER,
    ],
  },
};

export const DOCUMENT_ACTION_PERMISSION_ROLE_TEXT = {
  [DocumentActionPermissionPrinciple.SHARER]: 'common.sharers',
  [DocumentActionPermissionPrinciple.EDITOR]: 'common.editors',
  [DocumentActionPermissionPrinciple.VIEWER]: 'common.commenters',
};
