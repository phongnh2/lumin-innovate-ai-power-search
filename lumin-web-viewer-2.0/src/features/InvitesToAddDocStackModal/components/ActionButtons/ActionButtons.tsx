import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import styles from './ActionButtons.module.scss';

type ActionButtonsProps = {
  onDismiss(): void;
  onSubmit(): void;
  canSubmit: boolean;
  isSubmitting: boolean;
};

const ActionButtons = ({ onDismiss, onSubmit, canSubmit, isSubmitting }: ActionButtonsProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <Button size="lg" variant="text" disabled={isSubmitting} onClick={onDismiss}>
        {t('common.maybeLater')}
      </Button>
      <Button
        size="lg"
        variant="filled"
        disabled={isSubmitting || !canSubmit}
        loading={isSubmitting}
        onClick={onSubmit}
      >
        {t('memberPage.invite')}
      </Button>
    </div>
  );
};

export default ActionButtons;
