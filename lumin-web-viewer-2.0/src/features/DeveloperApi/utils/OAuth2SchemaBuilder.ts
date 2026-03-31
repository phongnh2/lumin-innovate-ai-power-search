import i18next from 'i18next';

import Yup from 'utils/yup';

import { ApplicationType } from 'features/DeveloperApi/interfaces';

const FIELD_REQUIRED_MESSAGE = 'errorMessage.fieldRequired';
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'] as const;

const isAppUrl = (uri: string) => /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]+$/.test(uri);

const isHttpsUrl = (uri: string) => uri.startsWith('https://') && Yup.string().url().isValidSync(uri);

class OAuth2SchemaBuilder {
  private shape: Record<string, Yup.AnySchema> = {};

  addClientName() {
    this.shape.clientName = Yup.string()
      .max(50, i18next.t('developerApi.integrationApps.errorMessage.maxLengthMessage', { max: 50 }))
      .required(i18next.t(FIELD_REQUIRED_MESSAGE));
    return this;
  }

  addApplicationType() {
    this.shape.applicationType = Yup.string()
      .oneOf(Object.values(ApplicationType))
      .required(i18next.t(FIELD_REQUIRED_MESSAGE));
    return this;
  }

  addRedirectUris() {
    this.shape.redirectUris = Yup.array()
      .of(Yup.string())
      .test('is-not-empty', i18next.t(FIELD_REQUIRED_MESSAGE), (value) => Array.isArray(value) && value.length > 0)
      .test(
        'are-valid-redirect-uris',
        i18next.t('developerApi.integrationApps.errorMessage.validRedirectUri'),
        (value) => value.every((uri) => typeof uri === 'string' && (isAppUrl(uri) || isHttpsUrl(uri)))
      );
    return this;
  }

  addWebsiteFields() {
    this.shape.websiteUrl = Yup.string()
      .url(i18next.t('developerApi.integrationApps.errorMessage.validWebsiteUrl'))
      .required(i18next.t(FIELD_REQUIRED_MESSAGE));
    return this;
  }

  addWebhookUrl() {
    this.shape.webhookUrl = Yup.string()
      .url(i18next.t('developerApi.integrationApps.errorMessage.validWebhookUrl'))
      .notRequired();
    return this;
  }

  addPrivacyPolicyUrl() {
    this.shape.privacyPolicyUrl = Yup.string()
      .url(i18next.t('developerApi.integrationApps.errorMessage.validPrivacyPolicyUrl'))
      .required(i18next.t(FIELD_REQUIRED_MESSAGE));
    return this;
  }

  addTermsOfUseUrl() {
    this.shape.termsOfUseUrl = Yup.string()
      .url(i18next.t('developerApi.integrationApps.errorMessage.validTermsOfUseUrl'))
      .required(i18next.t(FIELD_REQUIRED_MESSAGE));
    return this;
  }

  addContactEmail() {
    this.shape.contactEmail = Yup.string()
      .isEmail(i18next.t('developerApi.integrationApps.errorMessage.validContactEmail'))
      .required(i18next.t(FIELD_REQUIRED_MESSAGE));
    return this;
  }

  addFile({
    maxSize = MAX_FILE_SIZE,
    allowed = ALLOWED_TYPES,
  }: {
    maxSize?: number;
    allowed?: readonly string[];
  } = {}) {
    this.shape.file = Yup.mixed<File | string>()
      .required(i18next.t(FIELD_REQUIRED_MESSAGE))
      .test(
        'file-size',
        i18next.t('developerApi.integrationApps.errorMessage.validAppLogo', {
          maxMB: Math.round(maxSize / (1024 * 1024)),
        }),
        (file) => {
          if (!file) {
            return false;
          }
          if (typeof file === 'string') {
            return true;
          }
          return file.size <= maxSize;
        }
      )
      .test('file-type', i18next.t('developerApi.integrationApps.errorMessage.validAppLogoType'), (file) => {
        if (!file) {
          return false;
        }
        if (typeof file === 'string') {
          return true;
        }
        return allowed.includes(file.type);
      });
    return this;
  }

  build() {
    return Yup.object().shape(this.shape);
  }
}

export default OAuth2SchemaBuilder;
