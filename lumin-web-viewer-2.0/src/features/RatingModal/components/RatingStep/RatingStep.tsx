import { Button, IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { RATING_SCORES, RATING_MODAL_CONSTANTS } from '../../constants';

import styles from './RatingStep.module.scss';

interface RatingStepProps {
  onRatingSelect: (score: number) => void;
  isDisabled: boolean;
  onClose: () => void;
}

const RatingStep: React.FC<RatingStepProps> = ({ onRatingSelect, isDisabled, onClose }) => {
  const { t } = useTranslation();

  const renderRatingScales = (): JSX.Element => (
    <div className={styles.ratingScalesWrapper}>
      {RATING_SCORES.map((value, index) => (
        <Button
          key={value}
          variant="tonal"
          size="md"
          className={styles.ratingButton}
          style={{
            '--rating-button-animation-delay': `${index * RATING_MODAL_CONSTANTS.ANIMATION_DELAY_INCREMENT}s`,
          }}
          onClick={() => onRatingSelect(value)}
          disabled={isDisabled}
        >
          {value}
        </Button>
      ))}
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <IconButton
        className={styles.closeIcon}
        icon="x-md"
        onClick={onClose}
        size="md"
        iconColor="var(--kiwi-colors-surface-on-surface)"
      />
      <Text type="title" size="md" className={styles.title}>
        {t('modal.ratingTitle')}
      </Text>
      {renderRatingScales()}
      <div className={styles.descriptionsWrapper}>
        <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface)">
          {t('modal.minRate')}
        </Text>
        <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface)">
          {t('modal.maxRate')}
        </Text>
      </div>
    </div>
  );
};

export default RatingStep;
