import { Button, TextInput } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import useAccountCallback from './hooks/useAccountCallback';
import styles from '../../DeveloperApi.module.scss';

const AccountCallback = () => {
  const { t } = useTranslation();
  const {
    changeAccountCallback,
    onChangeCallbackUrl,
    callbackUrl,
    isFetching,
    isSubmitting,
    initialCallbackUrl,
    errorText,
    canCreateAccountCallback,
  } = useAccountCallback();
  return (
    <>
      <div className={styles.sectionHeaderWrapper}>
        <div>
          <h2 className={styles.sectionTitle}>{t('developerApi.accountCallback')}</h2>
          <p className={styles.sectionDescription}>{t('developerApi.accountCallbackDesc')}</p>
        </div>
      </div>
      <div className={styles.formWrapper}>
        <TextInput
          size="lg"
          placeholder="https://myapp.com/api/callback"
          className={styles.callbackInput}
          value={callbackUrl}
          onChange={(e) => onChangeCallbackUrl(e.target.value)}
          error={errorText}
          disabled={!canCreateAccountCallback || isSubmitting}
        />
        {canCreateAccountCallback && (
          <Button
            size="lg"
            loading={isSubmitting}
            disabled={isFetching || callbackUrl === initialCallbackUrl}
            onClick={changeAccountCallback}
          >
            {t('common.save')}
          </Button>
        )}
      </div>
    </>
  );
};
export default AccountCallback;
