import { ArrowLeftIcon } from '@luminpdf/icons/dist/csr/ArrowLeft';
import { Button, IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { useApiAppContext } from 'features/DeveloperApi/hooks/useApiAppContext';
import { ApplicationType } from 'features/DeveloperApi/interfaces';

import useOAuth2EdittingHandler from './hooks/useOAuth2EdittingHandler';
import { useSetupAppLogoEditMode } from './hooks/useSetupAppLogoEditMode';
import OAuth2Form from '../OAuth2Form';

import styles from './OAuth2Editting.module.scss';

const OAuth2Editting = () => {
  const { t } = useTranslation();
  const {
    handleEditApp,
    resetAppScreenState,
    editOAuth2FormHandler: { formState, register, control, watch },
  } = useOAuth2EdittingHandler();
  const { appScreenState } = useApiAppContext();
  const applicationType = watch('applicationType' as keyof typeof watch) as unknown as ApplicationType;
  useSetupAppLogoEditMode({ watch });

  return (
    <form className={styles.container} onSubmit={handleEditApp}>
      <div className={styles.header}>
        <IconButton icon={<ArrowLeftIcon size={32} />} onClick={resetAppScreenState} />
        <h2 className={styles.headerTitle}>{t('developerApi.integrationApps.editApplicationFormTitle')}</h2>
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
        <OAuth2Form.AppTypeField control={control} formState={formState} disabled />
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
        <OAuth2Form.AppLogoField
          control={control}
          formState={formState}
          watch={watch}
          previewLogoSrc={appScreenState.type === 'editting' ? appScreenState?.payload?.previewLogo?.src : null}
        />
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
          disabled={formState.isSubmitting || formState.isValidating || !formState.isValid || !formState.isDirty}
        >
          {t('common.update')}
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

export default OAuth2Editting;
