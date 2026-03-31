import { ImageIcon } from '@luminpdf/icons/dist/csr/Image';
import { Button, Checkbox, FileButton, Select, Textarea, TextInput } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { Control, Controller, FormState, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { ApplicationType as ApplicationTypeEnum, Scope } from 'features/DeveloperApi/interfaces';

import styles from './OAuth2Form.module.scss';

const AppNameField = ({
  register,
  formState,
}: {
  register: UseFormRegister<{ clientName?: string }>;
  formState: FormState<{ clientName?: string }>;
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.cardContentItem}>
      <div>
        <h4 className={styles.cardContentItemTitle}>
          {t('developerApi.integrationApps.appNameForm')}
          <span className={styles.asterisk}>*</span>
        </h4>
        <p className={styles.cardContentItemDescription}>{t('developerApi.integrationApps.appNameFormDesc')}</p>
      </div>
      <TextInput
        placeholder={t('developerApi.integrationApps.appNameFormPlaceholder')}
        {...register('clientName')}
        error={formState.errors.clientName?.message}
      />
    </div>
  );
};

const AppTypeField = ({
  control,
  formState,
  disabled,
}: {
  control: Control<{ applicationType?: ApplicationTypeEnum }>;
  formState: FormState<{ applicationType?: ApplicationTypeEnum }>;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  const applicationTypeOptions = [
    {
      label: t('developerApi.integrationApps.privateApplication'),
      value: ApplicationTypeEnum.SERVER_APPLICATION,
      description: t('developerApi.integrationApps.privateApplicationDesc'),
    },
    {
      label: t('developerApi.integrationApps.publicApplication'),
      value: ApplicationTypeEnum.CLIENT_APPLICATION,
      description: t('developerApi.integrationApps.publicApplicationDesc'),
    },
  ];

  const renderAppOptions = ({ option }: { option: typeof applicationTypeOptions[number] }) => (
    <div className={styles.cardContentItemOption}>
      <h5 className={styles.optionLabel}>{option.label}</h5>
      <p className={styles.optionDescription}>{option.description}</p>
    </div>
  );

  return (
    <div className={styles.cardContentItem}>
      <h4 className={styles.cardContentItemTitle}>
        {t('developerApi.integrationApps.appType')}
        <span className={styles.asterisk}>*</span>
      </h4>
      <Controller
        control={control}
        name="applicationType"
        render={({ field }) => (
          <Select
            data={applicationTypeOptions}
            renderOption={renderAppOptions}
            placeholder={t('developerApi.integrationApps.appTypePlaceholder')}
            error={formState.errors.applicationType?.message}
            disabled={disabled}
            {...field}
          />
        )}
      />
    </div>
  );
};

const ScopesField = ({ control }: { control: Control<{ scopes?: Scope[] }> }) => {
  const { t } = useTranslation();

  const scopes = [
    {
      type: t('developerApi.integrationApps.accountInfo.resource'),
      permissions: [
        {
          value: Scope.OPEN_ID,
          label: t('developerApi.integrationApps.accountInfo.accessUserIdentity'),
          description: t('developerApi.integrationApps.accountInfo.accessUserIdentityDesc'),
          disabledUncheck: true,
        },
        {
          value: Scope.PROFILE_READ,
          label: t('developerApi.integrationApps.accountInfo.viewProfile'),
          description: t('developerApi.integrationApps.accountInfo.profileReadDesc'),
        },
      ],
    },
    {
      type: t('developerApi.integrationApps.settings.resource'),
      permissions: [
        {
          value: Scope.PROFILE_SETTINGS,
          label: t('developerApi.integrationApps.settings.configUserSettings'),
          description: t('developerApi.integrationApps.settings.configUserSettingDesc'),
        },
      ],
    },
    {
      type: t('developerApi.integrationApps.files.resource'),
      permissions: [
        {
          value: Scope.PDF_FILES,
          label: t('developerApi.integrationApps.files.manageFiles'),
          description: t('developerApi.integrationApps.files.manageFilesDesc'),
        },
        {
          value: Scope.PDF_FILES_READ,
          label: t('developerApi.integrationApps.files.viewFiles'),
          description: t('developerApi.integrationApps.files.viewFilesDesc'),
        },
      ],
    },
    {
      type: t('developerApi.integrationApps.signatureRequests.resource'),
      permissions: [
        {
          value: Scope.SIGN_REQUEST,
          label: t('developerApi.integrationApps.signatureRequests.manageSignatureRequests'),
          description: t('developerApi.integrationApps.signatureRequests.manageSignatureRequestsDesc'),
        },
        {
          value: Scope.SIGN_REQUEST_READ,
          label: t('developerApi.integrationApps.signatureRequests.viewSignatureRequests'),
          description: t('developerApi.integrationApps.signatureRequests.viewSignatureRequestDesc'),
        },
      ],
    },
    {
      type: t('developerApi.integrationApps.templates.resource'),
      permissions: [
        {
          value: Scope.TEMPLATES,
          label: t('developerApi.integrationApps.templates.manageTemplates'),
          description: t('developerApi.integrationApps.templates.manageTemplatesDesc'),
        },
      ],
    },
    {
      type: t('developerApi.integrationApps.agreements.resource'),
      permissions: [
        {
          value: Scope.AGREEMENTS,
          label: t('developerApi.integrationApps.agreements.manageAgreements'),
          description: t('developerApi.integrationApps.agreements.manageAgreementsDesc'),
        },
      ],
    },
    {
      type: t('developerApi.integrationApps.workspaces.resource'),
      permissions: [
        {
          value: Scope.WORKSPACES_READ,
          label: t('developerApi.integrationApps.workspaces.viewWorkspaces'),
          description: t('developerApi.integrationApps.workspaces.viewWorkspacesDesc'),
        },
      ],
    },
  ];

  return (
    <div className={styles.cardContentItem}>
      <div>
        <h4 className={styles.cardContentItemTitle}>{t('developerApi.integrationApps.scopes')}</h4>
        <p className={styles.cardContentItemDescription}>{t('developerApi.integrationApps.scopesDesc')}</p>
      </div>
      <div className={styles.scopeContainer}>
        {scopes.map((scope) => (
          <div key={scope.type} className={styles.scopeItem}>
            <div className={styles.scopeType}>
              <b>{scope.type}</b>
            </div>
            {scope.permissions.map((permission) => (
              <div key={permission.label} className={styles.scopePermission}>
                <Controller
                  control={control}
                  name="scopes"
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      disabled={permission.disabledUncheck}
                      checked={value.includes(permission.value) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onChange([...value, permission.value]);
                        } else {
                          onChange(value.filter((v) => v !== permission.value));
                        }
                      }}
                    />
                  )}
                />
                <div className={styles.permissionContent}>
                  <p className={styles.permissionLabel}>
                    <b>{permission.label}</b>
                  </p>
                  <p className={styles.permissionDescription}>{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const RedirectUrisField = ({
  control,
  formState,
}: {
  control: Control<{ redirectUris?: string[] }>;
  formState: FormState<{ redirectUris?: string[] }>;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.cardContentItem}>
      <div>
        <h4 className={styles.cardContentItemTitle}>
          {t('developerApi.integrationApps.redirectUrisForm')}
          <span className={styles.asterisk}>*</span>
        </h4>
        <p className={styles.cardContentItemDescription}>{t('developerApi.integrationApps.redirectUrisFormDesc')}</p>
      </div>
      <Controller
        control={control}
        name="redirectUris"
        render={({ field: { onChange, value, onBlur } }) => (
          <Textarea
            placeholder="https://your-app.com/callback"
            rows={3}
            value={value.join(',')}
            onChange={(e) => onChange(e.target.value.split(','))}
            onBlur={onBlur}
            error={formState.errors.redirectUris?.message}
          />
        )}
      />
      <p className={styles.cardContentItemNote}>
        <Trans i18nKey="developerApi.integrationApps.redirectUrisFormNote" components={{ b: <b /> }} />
      </p>
    </div>
  );
};

const AppLogoField = ({
  control,
  formState,
  previewLogoSrc,
  watch,
}: {
  control: Control<{ file?: File }>;
  formState: FormState<{ file?: File }>;
  previewLogoSrc?: string | null;
  watch: UseFormWatch<{ file?: File }>;
}) => {
  const { t } = useTranslation();
  const [previewSrc, setPreviewSrc] = useState('');
  const file = watch('file');

  useEffect(() => {
    if (file instanceof File) {
      setPreviewSrc(URL.createObjectURL(file));
    } else if (typeof file === 'string') {
      if (previewLogoSrc) {
        setPreviewSrc(previewLogoSrc);
        return;
      }

      setPreviewSrc(file);
    }
  }, [file, previewLogoSrc]);

  const renderPreview = () => {
    if (previewSrc) {
      return <img className={styles.imgPreview} src={previewSrc} alt="app logo" />;
    }
    return null;
  };

  const renderUploadButtonMessage = () =>
    previewSrc ? t('developerApi.integrationApps.updateLogo') : t('developerApi.integrationApps.chooseLogo');

  return (
    <div className={styles.cardContentItem}>
      <div>
        <h4 className={styles.cardContentItemTitle}>
          {t('developerApi.integrationApps.appLogo')}
          <span className={styles.asterisk}>*</span>
        </h4>
        <p className={styles.cardContentItemDescription}>
          {t('developerApi.integrationApps.appLogoDesc', { maxMB: 3 })}
        </p>
      </div>
      <Controller
        control={control}
        name="file"
        render={({ field }) => (
          <FileButton
            accept="image/jpg, image/jpeg, image/png"
            onChange={(newFile) => {
              if (newFile) {
                field.onChange(newFile);
              }
            }}
          >
            {(props) => (
              <>
                <Button
                  {...props}
                  variant="outlined"
                  size="md"
                  startIcon={<ImageIcon size={20} />}
                  style={{ width: 'fit-content' }}
                  disabled={formState.isSubmitting}
                >
                  {renderUploadButtonMessage()}
                </Button>
                {formState.errors.file?.message && (
                  <p className={styles.errorMessage}>{formState.errors.file?.message}</p>
                )}
              </>
            )}
          </FileButton>
        )}
      />
      {renderPreview()}
    </div>
  );
};

const WebsiteUrlField = ({
  register,
  formState,
}: {
  register: UseFormRegister<{ websiteUrl?: string }>;
  formState: FormState<{ websiteUrl?: string }>;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.cardContentItem}>
      <h4 className={styles.cardContentItemTitle}>
        {t('developerApi.integrationApps.website')}
        <span className={styles.asterisk}>*</span>
      </h4>
      <TextInput
        placeholder="https://your-website.com"
        {...register('websiteUrl')}
        error={formState.errors.websiteUrl?.message}
      />
    </div>
  );
};

const PrivacyPolicyUrlField = ({
  register,
  formState,
}: {
  register: UseFormRegister<{ privacyPolicyUrl?: string }>;
  formState: FormState<{ privacyPolicyUrl?: string }>;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.cardContentItem}>
      <h4 className={styles.cardContentItemTitle}>
        {t('developerApi.integrationApps.privacyPolicyUrl')}
        <span className={styles.asterisk}>*</span>
      </h4>
      <TextInput
        placeholder="https://your-website.com/privacy"
        {...register('privacyPolicyUrl')}
        error={formState.errors.privacyPolicyUrl?.message}
      />
    </div>
  );
};

const TermsOfUseUrlField = ({
  register,
  formState,
}: {
  register: UseFormRegister<{ termsOfUseUrl?: string }>;
  formState: FormState<{ termsOfUseUrl?: string }>;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.cardContentItem}>
      <h4 className={styles.cardContentItemTitle}>
        {t('developerApi.integrationApps.termsOfUseUrl')}
        <span className={styles.asterisk}>*</span>
      </h4>
      <TextInput
        placeholder="https://your-website.com/terms"
        {...register('termsOfUseUrl')}
        error={formState.errors.termsOfUseUrl?.message}
      />
    </div>
  );
};

const ContactEmailField = ({
  register,
  formState,
}: {
  register: UseFormRegister<{ contactEmail?: string }>;
  formState: FormState<{ contactEmail?: string }>;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.cardContentItem}>
      <div>
        <h4 className={styles.cardContentItemTitle}>
          {t('developerApi.integrationApps.contactEmail')}
          <span className={styles.asterisk}>*</span>
        </h4>
        <p className={styles.cardContentItemDescription}>{t('developerApi.integrationApps.contactEmailDesc')}</p>
      </div>
      <TextInput
        placeholder="contact@your-company.com"
        {...register('contactEmail')}
        error={formState.errors.contactEmail?.message}
      />
    </div>
  );
};

const WebhookUrlField = ({
  register,
  formState,
  disabled,
}: {
  register: UseFormRegister<{ webhookUrl?: string }>;
  formState: FormState<{ webhookUrl?: string }>;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.cardContentItem}>
      <h4 className={styles.cardContentItemTitle}>{t('developerApi.integrationApps.webhook')}</h4>
      <TextInput
        placeholder="https://your-website.com"
        disabled={disabled}
        {...register('webhookUrl')}
        error={formState.errors.webhookUrl?.message}
      />
    </div>
  );
};

const Card = ({ children, header }: { children: React.ReactNode; header: React.ReactNode }) => (
  <div className={styles.card}>
    {header}
    <div className={styles.cardContent}>{children}</div>
  </div>
);

const OAuth2Form = {
  Card,
  AppNameField,
  AppTypeField,
  ScopesField,
  RedirectUrisField,
  AppLogoField,
  WebsiteUrlField,
  PrivacyPolicyUrlField,
  TermsOfUseUrlField,
  ContactEmailField,
  WebhookUrlField,
};

export default OAuth2Form;
