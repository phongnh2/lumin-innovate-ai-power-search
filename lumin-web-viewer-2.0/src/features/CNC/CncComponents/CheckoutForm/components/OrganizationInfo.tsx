import { TextInput, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { IOrganization } from 'interfaces/organization/organization.interface';

import styles from './OrganizationInfo.module.scss';

const OrganizationInfo = ({ currentOrganization }: { currentOrganization: IOrganization }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <Text type="headline" size="lg" className={styles.orgInfoTitle}>
        {t('common.orgInfo')}
      </Text>
      <div className={styles.inputWrapper}>
        <div>
          <TextInput value={currentOrganization?.name} readOnly size="lg" />
        </div>
      </div>
    </div>
  );
};

export default OrganizationInfo;
