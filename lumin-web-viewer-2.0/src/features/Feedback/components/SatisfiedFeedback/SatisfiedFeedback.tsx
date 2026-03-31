import classNames from 'classnames';
import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DissatisfiedImg from 'assets/images/dissatisfied.png';
import NeutralImg from 'assets/images/neutral.png';
import SatisfiedImg from 'assets/images/satisfied.png';
import VeryDissatisfiedImg from 'assets/images/very-dissatisfied.png';
import VerySatisfiedImg from 'assets/images/very-satisfied.png';

import { SatisfiedLevel } from 'features/Feedback/constants';
import { useFeedbackContext } from 'features/Feedback/hooks';

import styles from './SatisfiedFeedback.module.scss';

const SATISFIED_FEEDBACK_LIST = [
  {
    level: SatisfiedLevel.VeryDissatisfied,
    imgSrc: VeryDissatisfiedImg,
  },
  {
    level: SatisfiedLevel.Dissatisfied,
    imgSrc: DissatisfiedImg,
  },
  {
    level: SatisfiedLevel.Neutral,
    imgSrc: NeutralImg,
  },
  {
    level: SatisfiedLevel.Satisfied,
    imgSrc: SatisfiedImg,
  },
  {
    level: SatisfiedLevel.VerySatisfied,
    imgSrc: VerySatisfiedImg,
  },
];

const SATISFIED_FEEDBACK_LIST_WEB = [
  {
    level: SatisfiedLevel.Dissatisfied,
    imgSrc: VeryDissatisfiedImg,
  },
  {
    level: SatisfiedLevel.Neutral,
    imgSrc: NeutralImg,
  },
  {
    level: SatisfiedLevel.Satisfied,
    imgSrc: VerySatisfiedImg,
  },
];

type SatisfiedFeedbackProps = {
  shouldApplyReskin?: boolean;
};

const SatisfiedFeedback = ({ shouldApplyReskin = false }: SatisfiedFeedbackProps) => {
  const {
    handleNextStep,
    feedbackFormHandler: { control },
  } = useFeedbackContext();
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Text className={styles.title} component="h3" type="body" size="lg" color="var(--kiwi-colors-surface-on-surface)">
        {t('shareDocumentFeedbackModal.satisfiedFeedbackTitle')}
      </Text>
      <div className={shouldApplyReskin ? styles.satisfiedFeedbackReskin : styles.satisfiedFeedback}>
        {(shouldApplyReskin ? SATISFIED_FEEDBACK_LIST_WEB : SATISFIED_FEEDBACK_LIST).map(({ imgSrc, level }) => (
          <Controller
            key={level}
            control={control}
            name="satisfiedCategory"
            render={({ field: { onChange, value } }) => (
              <img
                src={imgSrc}
                onClick={() => {
                  handleNextStep();
                  onChange(level);
                }}
                alt={level}
                className={classNames(
                  shouldApplyReskin ? styles.itemReskin : styles.item,
                  value && {
                    [styles.selected]: value === level,
                    [styles.unSelected]: value !== level,
                  }
                )}
              />
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default SatisfiedFeedback;
