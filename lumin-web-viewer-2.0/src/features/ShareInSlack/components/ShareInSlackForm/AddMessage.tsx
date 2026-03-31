import { Textarea } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import styles from './ShareInSlackForm.module.scss';

const AddMessage = ({ message, setMessage }: { message: string; setMessage: (message: string) => void }) => {
  const { t } = useTranslation();

  const renderLabel = () => (
    <div className={styles.addMessageLabelWrapper}>
      <div className={styles.addMessageLabel}>
        <p>{t('modalShare.addMessage')}</p>&nbsp;
        <p className={styles.optionalText}>{`(${t('common.optional')})`}</p>
      </div>
      <p className={styles.optionalText}>{`${message.length}/3000`}</p>
    </div>
  );

  return (
    <Textarea
      size="lg"
      placeholder={t('shareInSlack.addMessagePlaceholder')}
      rows={3}
      maxLength={3000}
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      label={renderLabel()}
      classNames={{
        input: styles.addMessageInput,
        label: styles.addMessageLabelContainer,
      }}
    />
  );
};

export default AddMessage;
