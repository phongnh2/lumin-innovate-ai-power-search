import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import styles from './FreeTrialNotes.module.scss';

const FreeTrialNotes = () => {
  const { t } = useTranslation();
  const notes = [t('freeTrialNotes.cancelOrChangePlans'), t('freeTrialNotes.moneyBackGuarantee')];

  return (
    <div className={styles.container}>
      {notes.map((note) => (
        <div className={styles.noteItem} key={note}>
          <Icomoon type="lm-checkbox-square" className={styles.icon} />
          <Text size="md" type="body">
            {note}
          </Text>
        </div>
      ))}
    </div>
  );
};

export default FreeTrialNotes;
