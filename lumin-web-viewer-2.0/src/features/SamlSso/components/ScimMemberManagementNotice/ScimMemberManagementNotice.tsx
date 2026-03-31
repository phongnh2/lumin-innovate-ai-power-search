import classNames from 'classnames';
import { Text } from 'lumin-ui/kiwi-ui';
import React, { HTMLAttributes } from 'react';

import { useTranslation } from 'hooks';

import { useGetScimEnabled } from 'features/SamlSso/hooks';

import styles from './ScimMemberManagementNotice.module.scss';

const ScimMemberManagementNotice = (props: HTMLAttributes<HTMLDivElement>) => {
  const { className, ...otherProps } = props;
  const { t } = useTranslation();
  const isScimEnabled = useGetScimEnabled();

  if (!isScimEnabled) {
    return null;
  }

  return (
    <div className={classNames(styles.container, className)} {...otherProps}>
      <Text type="body" size="md">
        {t('scimProvision.scimMemberManagementNotice')}
      </Text>
    </div>
  );
};

export default ScimMemberManagementNotice;
