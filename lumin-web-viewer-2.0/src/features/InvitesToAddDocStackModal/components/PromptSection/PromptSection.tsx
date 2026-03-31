import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import styles from './PromptSection.module.scss';

const PromptSection = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('invitesToAddDocStackModal.promptSection.title')}</h1>
      <div className={styles.wrapper}>
        <p className={styles.content}>{t('invitesToAddDocStackModal.promptSection.informContent')}</p>
        <p className={styles.content}>
          <Trans
            i18nKey="invitesToAddDocStackModal.promptSection.extraContent"
            components={{
              b: <b className="kiwi-message--primary" />,
            }}
          />
        </p>
      </div>
    </div>
  );
};

export default PromptSection;
