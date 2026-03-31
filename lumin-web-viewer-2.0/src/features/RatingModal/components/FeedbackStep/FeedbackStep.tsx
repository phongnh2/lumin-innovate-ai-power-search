import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks/useTranslation';

import { FEEDBACK_URL } from 'constants/Routers';

import styles from './FeedbackStep.module.scss';

interface FeedbackStepProps {
  onClose: () => void;
  onClickSendFeedback: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const FeedbackStep: React.FC<FeedbackStepProps> = ({ onClose, onClickSendFeedback }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.feedbackWrapper}>
      <IconButton
        className={styles.closeIcon}
        icon="x-md"
        onClick={onClose}
        size="md"
        iconColor="var(--kiwi-colors-surface-on-surface)"
      />
      <div className={styles.feedbackLogoWrapper}>
        <SvgElement content="Feedback" width={48} height={48} />
      </div>
      <Text type="title" size="md" color="var(--kiwi-colors-surface-on-surface)">
        {t('modal.feedbackTitle')}
      </Text>
      <Text type="body" size="sm" className={styles.feedbackDescriptionWrapper}>
        <Trans
          i18nKey="modal.feedbackDescription"
          components={{
            b: (
              <a className={styles.feedbackLink} onClick={onClickSendFeedback} href={FEEDBACK_URL}>
                here
              </a>
            ),
          }}
        />
      </Text>
    </div>
  );
};

export default FeedbackStep;
