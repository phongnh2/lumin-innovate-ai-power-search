import { Button, IconButton, Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import DarkTrustpilotLogo from 'assets/images/trustpilot-logo-dark.svg';
import LightTrustpilotLogo from 'assets/images/trustpilot-logo.svg';

import { useThemeMode } from 'hooks/useThemeMode';
import { useTranslation } from 'hooks/useTranslation';

import styles from './TrustpilotStep.module.scss';

interface TrustpilotStepProps {
  onClose: () => void;
  onClickTrustpilotReview: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const TrustpilotStep: React.FC<TrustpilotStepProps> = ({ onClose, onClickTrustpilotReview }) => {
  const { t } = useTranslation();
  const theme = useThemeMode();

  const trustpilotLogo = useMemo(
    () =>
      ({
        light: LightTrustpilotLogo,
        dark: DarkTrustpilotLogo,
      }[theme]),
    [theme]
  );

  return (
    <div className={styles.trustpilotWrapper}>
      <IconButton
        className={styles.closeIcon}
        icon="x-md"
        onClick={onClose}
        size="md"
        iconColor="var(--kiwi-colors-surface-on-surface)"
      />
      <div>
        <img src={trustpilotLogo} alt="trustpilot" width={130} height={32} />
      </div>
      <div className={styles.trustpilotContent}>
        <Text type="body" size="sm" className={styles.trustpilotDescription}>
          {t('modal.trustpilotDescription')}
        </Text>
        <Button onClick={onClickTrustpilotReview} variant="outlined" size="md">
          {t('modal.trustpilotButton')}
        </Button>
      </div>
    </div>
  );
};

export default TrustpilotStep;
