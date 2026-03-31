import { Stepper, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import styles from './VerticalLinearStepper.module.scss';

const STEPS = [
  {
    label: 'checkoutModal.stepper.step1.title',
  },
  {
    label: 'checkoutModal.stepper.step2.title',
  },
  {
    label: 'checkoutModal.stepper.step3.title',
  },
];

interface BillingInfoProps {
  activeStep?: number;
}

const VerticalLinearStepper: React.FC<BillingInfoProps> = ({ activeStep = 0 }) => {
  const { t } = useTranslation();

  return (
    <Stepper
      active={activeStep}
      iconSize={24}
      orientation="vertical"
      color="var(--kiwi-colors-core-primary)"
      classNames={{
        verticalSeparator: styles.separator,
        stepIcon: styles.stepIcon,
        stepBody: styles.stepBody,
      }}
    >
      {STEPS.map((step, index) => (
        <Stepper.Step
          key={index}
          label={
            <Text type="title" size="sm" color="var(--kiwi-colors-core-on-primary-container)">
              {t(step.label)}
            </Text>
          }
          icon={
            <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface-low)">
              {index + 1}
            </Text>
          }
        />
      ))}
      <Stepper.Completed>{t('checkoutModal.stepper.completed')}</Stepper.Completed>
    </Stepper>
  );
};

export default VerticalLinearStepper;
