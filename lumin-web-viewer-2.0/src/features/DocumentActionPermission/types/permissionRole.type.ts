import { Icon as IconType } from '@luminpdf/icons/dist/lib/types';

import { DocumentActionPermissionPrinciple } from '../constants/permissionRole.constant';

export type PermissionRoleOptions = {
  label: string;
  value: string;
  data: {
    Icon: IconType;
  };
};

export type DocumentActionPermissionPrincipleType = keyof typeof DocumentActionPermissionPrinciple;
