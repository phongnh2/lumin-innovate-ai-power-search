import { Icomoon, Modal, Textarea } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import styles from './FeedBackModal.module.scss';

export const FeedbackModal = ({
  open,
  onClose,
  onConfirm,
  feedbackValue,
  setFeedbackValue,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  feedbackValue: string;
  setFeedbackValue: (value: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('viewer.chatbot.menu.feedbackModal.title')}
      opened={open}
      onClose={onClose}
      onConfirm={onConfirm}
      onCancel={onClose}
      confirmButtonProps={{
        title: t('viewer.chatbot.menu.feedbackModal.send'),
        endIcon: <Icomoon type="ph-arrow-right" size="md" />,
      }}
      cancelButtonProps={{ title: t('viewer.chatbot.menu.feedbackModal.close'), onClick: onClose, variant: 'text' }}
    >
      <div className={styles.container}>
        <p className={styles.description}>{t('viewer.chatbot.menu.feedbackModal.description')}</p>

        <Textarea
          placeholder={t('viewer.chatbot.menu.feedbackModal.placeholder')}
          classNames={{
            input: styles.textarea,
            root: styles.textareaRoot,
          }}
          value={feedbackValue}
          onChange={(e) => setFeedbackValue(e.target.value)}
        />
      </div>
    </Modal>
  );
};
