import { ArrowLeftIcon } from '@luminpdf/icons/dist/csr/ArrowLeft';
import { Button, IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks/useTranslation';

import { useApiAppContext } from 'features/DeveloperApi/hooks/useApiAppContext';
import { ApplicationType } from 'features/DeveloperApi/interfaces';

import { useHandleCreateApp } from './hooks/useHandleCreateApp';
import OAuth2Form from '../OAuth2Form';

import styles from './OAuth2Creator.module.scss';

const OAuth2Creator = () => {
  const { t } = useTranslation();
  const { resetAppScreenState, addOAuthClient } = useApiAppContext();
  const {
    handleCreateApp,
    createAppFormHandler: { register, control, formState, watch },
  } = useHandleCreateApp({
    addOAuthClient,
    resetAppScreenState,
  });

  const applicationType = watch('applicationType' as keyof typeof watch) as unknown as ApplicationType;

  return (
    <form className={styles.container} onSubmit={handleCreateApp}>
      <div className={styles.header}>
        <IconButton icon={<ArrowLeftIcon size={32} />} onClick={resetAppScreenState} />
        <h2 className={styles.headerTitle}>{t('developerApi.integrationApps.createApplication')}</h2>
      </div>
      <OAuth2Form.Card
        header={
          <div className={styles.cardHeader}>
            <h3 className={styles.cardHeaderTitle}>{t('developerApi.integrationApps.basicInfor')}</h3>
            <p className={styles.cardHeaderDescription}>{t('developerApi.integrationApps.basicInforDesc')}</p>
          </div>
        }
      >
        <OAuth2Form.AppNameField register={register} formState={formState} />
        <OAuth2Form.AppTypeField control={control} formState={formState} />
        <OAuth2Form.ScopesField control={control} />
        <OAuth2Form.RedirectUrisField control={control} formState={formState} />
      </OAuth2Form.Card>
      <OAuth2Form.Card
        header={
          <div className={styles.cardHeader}>
            <h3 className={styles.cardHeaderTitle}>{t('developerApi.integrationApps.consentScreen')}</h3>
            <p className={styles.cardHeaderDescription}>{t('developerApi.integrationApps.consentScreenDesc')}</p>
          </div>
        }
      >
        <OAuth2Form.AppLogoField control={control} formState={formState} watch={watch} />
        <OAuth2Form.WebsiteUrlField register={register} formState={formState} />
        <OAuth2Form.PrivacyPolicyUrlField register={register} formState={formState} />
        <OAuth2Form.TermsOfUseUrlField register={register} formState={formState} />
        <OAuth2Form.ContactEmailField register={register} formState={formState} />
      </OAuth2Form.Card>
      <OAuth2Form.Card
        header={
          <div className={styles.cardHeader}>
            <h3 className={styles.cardHeaderTitle}>{t('developerApi.integrationApps.webhookTitle')}</h3>
            <p className={styles.cardHeaderDescription}>
              <Trans i18nKey="developerApi.integrationApps.webhookDesc" components={{ b: <b /> }} />{' '}
              <a
                className={styles.learnMoreButtonText}
                href="https://developers.luminpdf.com/docs/api/webhooks/app-callbacks/"
                target="_blank"
                rel="noreferrer"
              >
                {t('common.learnMore')}
              </a>
            </p>
          </div>
        }
      >
        <OAuth2Form.WebhookUrlField
          register={register}
          formState={formState}
          disabled={applicationType !== ApplicationType.SERVER_APPLICATION}
        />
      </OAuth2Form.Card>
      <div className={styles.footer}>
        <Button
          type="submit"
          loading={formState.isSubmitting || formState.isValidating}
          disabled={formState.isSubmitting || formState.isValidating || !formState.isValid}
        >
          {t('common.create')}
        </Button>
        <Button
          variant="outlined"
          onClick={resetAppScreenState}
          disabled={formState.isSubmitting || formState.isValidating}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
};

export default OAuth2Creator;
