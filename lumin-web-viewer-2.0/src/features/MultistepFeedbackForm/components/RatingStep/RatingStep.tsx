import React from 'react';

import DissatisfiedImg from 'assets/images/dissatisfied.png';
import NeutralImg from 'assets/images/neutral.png';
import SatisfiedImg from 'assets/images/satisfied.png';
import VeryDissatisfiedImg from 'assets/images/very-dissatisfied.png';
import VerySatisfiedImg from 'assets/images/very-satisfied.png';

import { useTranslation } from 'hooks/useTranslation';

import { useMultistepFeedbackFormContext } from 'features/MultistepFeedbackForm/hooks';

import FormModal from '../FormModal';

import styles from './RatingStep.module.scss';

const scores = [
  {
    imgSrc: VeryDissatisfiedImg,
  },
  {
    imgSrc: DissatisfiedImg,
  },
  {
    imgSrc: NeutralImg,
  },
  {
    imgSrc: SatisfiedImg,
  },
  {
    imgSrc: VerySatisfiedImg,
  },
];

const RatingStep = () => {
  const { onNext, onScoreChange } = useMultistepFeedbackFormContext();
  const { t } = useTranslation();
  const onChange = (score: number) => {
    onScoreChange(score);
    onNext();
  };
  return (
    <>
      <FormModal.Title title={t('viewer.multiFeedbackForm.step1.title')} />
      <ul className={styles.iconList}>
        {scores.map((score, index) => (
          <li key={index}>
            <button className={styles.icon} onClick={() => onChange(index + 1)}>
              <img src={score.imgSrc} alt="icon" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default RatingStep;
