import { TFunction } from 'react-i18next';

import { formatLabelWithConjunction } from './formatContent.util';
import {
  DOCUMENT_ACTION_PERMISSION_ROLE_TEXT,
  DocumentActionPermissionPrinciple,
  PERMISSION_ROLES,
} from '../constants/permissionRole.constant';
import { PermissionRoleOptions } from '../types/permissionRole.type';

export const generatePermissionOptions = (t: TFunction): PermissionRoleOptions[] =>
  Object.entries(PERMISSION_ROLES).map(([key, value]) => ({
    label: formatLabelWithConjunction(
      value.value.map((item) =>
        item === DocumentActionPermissionPrinciple.ANYONE
          ? t('shareSettings.anyone')
          : t(DOCUMENT_ACTION_PERMISSION_ROLE_TEXT[item])
      ),
      t('common.and')
    ),
    value: key,
    data: {
      Icon: value.Icon,
    },
  }));
