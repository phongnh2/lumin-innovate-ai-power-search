import { Icon as IconType } from '@luminpdf/icons/dist/lib/types';
import { Select, Text } from 'lumin-ui/kiwi-ui';
import React, { Dispatch, SetStateAction, useMemo } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { PERMISSION_ROLES } from '../constants/permissionRole.constant';
import { PermissionRoleOptions } from '../types/permissionRole.type';
import { formatShareDocumentActionLabel } from '../utils/formatContent.util';
import { generatePermissionOptions } from '../utils/generatePermissionRoleContent.util';

import styles from './DocumentActionPermissionSetting.module.scss';

const renderOption = ({ option }: { option: PermissionRoleOptions }) => (
  <>
    <div className={styles.iconWrapper}>
      <option.data.Icon size={20} />
    </div>
    <Text type="label" size="md">
      {option.label}
    </Text>
  </>
);

const renderLeftSectionIcon = (Icon: IconType) => (Icon ? <Icon size={24} /> : null);

const DocumentActionPermissionSetting = ({
  selectedRolesPermission,
  setSelectedRolesPermission,
}: {
  selectedRolesPermission: string;
  setSelectedRolesPermission: Dispatch<SetStateAction<string>>;
}) => {
  const { t } = useTranslation();

  const actionLabel = useMemo(() => formatShareDocumentActionLabel(t), [t]);
  const permissionOptions = useMemo(() => generatePermissionOptions(t), [t]);
  const defaultValue = permissionOptions[0]?.value ?? '';
  const derivedValue = selectedRolesPermission || defaultValue;

  const handleChange = (value: string | null) => {
    setSelectedRolesPermission(value);
  };

  return (
    <Select
      label={t('shareSettings.actionPrinciple', {
        actions: actionLabel,
      })}
      classNames={{
        input: styles.input,
      }}
      data={permissionOptions}
      value={derivedValue}
      onChange={handleChange}
      size="lg"
      renderOption={renderOption}
      leftSection={renderLeftSectionIcon(PERMISSION_ROLES[derivedValue]?.Icon)}
    />
  );
};

export default DocumentActionPermissionSetting;
