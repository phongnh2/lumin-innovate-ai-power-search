import classNames from 'classnames';
import { Text, Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useNavigate } from 'react-router';

import FailedToAccessImage from 'assets/reskin/images/failed-to-access-document.png';

import { LayoutSecondary, styles } from 'luminComponents/ReskinLayout/components/LayoutSecondary';

import { useTranslation } from 'hooks';

import { Routers } from 'constants/Routers';

type FeatureRestrictedProps = {
  title?: string;
  description?: string;
  onAction?: VoidFunction;
  actionLabel?: string;
};

const FeatureRestricted = (props: FeatureRestrictedProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    title = t('featureRestricted.title'),
    description = t('featureRestricted.description'),
    actionLabel = t('featureRestricted.action'),
    onAction = () => navigate(Routers.ROOT),
  } = props;

  return (
    <LayoutSecondary>
      <img
        src={FailedToAccessImage}
        alt="failed-to-access-document"
        className={classNames(styles.image, styles.failedToAccessImage)}
      />
      <div>
        <Text type="headline" size="xl" className={styles.title}>
          {title}
        </Text>
        <Text type="body" size="lg">
          {description}
        </Text>
      </div>
      <div className={styles.buttonWrapper}>
        <Button size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </LayoutSecondary>
  );
};

export default FeatureRestricted;
