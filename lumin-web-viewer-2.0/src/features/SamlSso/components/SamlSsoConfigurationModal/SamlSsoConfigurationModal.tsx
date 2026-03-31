import { yupResolver } from '@hookform/resolvers/yup';
import { Collapse, IconButton, Modal, Skeleton, TagsInput, TextInput, Textarea } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useGetCurrentOrganization, useGetCurrentUser, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';
import Yup from 'utils/yup';

import { ErrorCode } from 'constants/errorCode';
import { TIMEOUT } from 'constants/lumin-common';

import { SamlSsoConfiguration } from 'interfaces/organization/organization.interface';

import styles from './SamlSsoConfigurationModal.module.scss';

interface SamlSsoConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isEdit: boolean;
}

const SamlSsoConfigurationModal = ({ isOpen, onClose, onSuccess, isEdit }: SamlSsoConfigurationModalProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const { _id: orgId, associateDomains } = useGetCurrentOrganization();

  const requiredErrorMessage = t('errorMessage.fieldRequired');

  const [samlSsoConfiguration, setSamlSsoConfiguration] = useState<SamlSsoConfiguration | null>(null);

  const [isFetchingConfiguration, setIsFetchingConfiguration] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        domains: Yup.array()
          .min(1, requiredErrorMessage)
          .of(
            Yup.string()
              .matches(
                /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
                t('samlSso.samlSsoConfigurationModal.domainsErrorMessage')
              )
              .oneOf(associateDomains, t('samlSso.samlSsoConfigurationModal.domainsErrorMessageOneOf'))
              .required(requiredErrorMessage)
          ),
        rawIdpMetadataXml: Yup.string().required(requiredErrorMessage),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requiredErrorMessage]
  );

  const { handleSubmit, formState, reset, control, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      domains: associateDomains,
      rawIdpMetadataXml: '',
    },
    shouldFocusError: true,
    resolver: yupResolver(validationSchema),
  });

  const handleCloseModal = useCallback(() => {
    setSamlSsoConfiguration(null);
    reset();
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = useCallback(
    async ({ domains, rawIdpMetadataXml }: { domains: string[]; rawIdpMetadataXml: string }) => {
      try {
        // convert rawIdpMetadataXml to base64
        const base64RawIdpMetadataXml = `base64://${btoa(rawIdpMetadataXml)}`;
        const configuration = await organizationServices.upsertSamlSsoConfiguration({
          orgId,
          domains,
          rawIdpMetadataXml: base64RawIdpMetadataXml,
        });
        setSamlSsoConfiguration(configuration);
        const sso = {
          createdBy: currentUser._id,
          ssoOrganizationId: configuration.id,
          samlSsoConnectionId: configuration.id,
        };
        dispatch(
          actions.updateCurrentOrganization({
            sso,
          })
        );
        onSuccess?.();
        await toastUtils.success({
          message: isEdit ? t('samlSso.toastUpdatedSuccessMessage') : t('samlSso.toastEnabledSuccessMessage'),
        });
        if (isEdit) {
          handleCloseModal();
        }
        // Clear dirty state without resetting form values
        reset(undefined, { keepValues: true });
      } catch (error) {
        const { code, metadata } = errorUtils.extractGqlError(error as Error) as { code: string; metadata?: unknown };
        switch (code) {
          case ErrorCode.Org.SAML_SSO_DOMAIN_ALREADY_CONFIGURED: {
            const { domains: alreadyConfiguredDomains } = metadata as { domains: string[] };
            toastUtils
              .error({
                message: t(
                  alreadyConfiguredDomains.length > 1
                    ? 'samlSso.samlSsoConfigurationModal.domainsAlreadyConfiguredOneOf'
                    : 'samlSso.samlSsoConfigurationModal.domainAlreadyConfigured',
                  { domains: alreadyConfiguredDomains.join(', ') }
                ),
              })
              .finally(() => {});
            break;
          }
          case ErrorCode.Org.UPSERT_SAML_SSO_CONNECTION_FAILED:
            toastUtils.error({ message: t('samlSso.upsertSamlSsoConnectionFailed') }).finally(() => {});
            break;
          default:
            toastUtils.openUnknownErrorToast().finally(() => {});
            break;
        }
        logger.logError({
          message: 'Error upserting SAML SSO configuration',
          error: error as Error,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgId, reset, currentUser._id, onSuccess, isEdit, handleCloseModal]
  );

  const domainsErrorMessage = useMemo((): string => {
    const errors = formState.errors.domains;
    if (Array.isArray(errors)) {
      return errors.reduce<string>((acc: string, curr: { message: string }) => acc + curr.message, '');
    }
    return errors?.message || '';
  }, [formState.errors.domains]);

  // copy
  const copyTimeout = useRef<NodeJS.Timeout | null>(null);
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({
    acsUrl: false,
    spEntityId: false,
  });

  const handleCopy = async (value: string, fieldName: keyof typeof copiedFields) => {
    await navigator.clipboard.writeText(value);
    setCopiedFields((prev) => ({ ...prev, [fieldName]: true }));
    toastUtils.success({ message: t('common.copiedToClipboard') }).finally(() => {});
    copyTimeout.current = setTimeout(() => {
      setCopiedFields((prev) => ({ ...prev, [fieldName]: false }));
    }, TIMEOUT.COPY);
  };

  useEffect(() => {
    const fetchSamlSsoConfiguration = async () => {
      if (!isEdit || !isOpen) {
        return;
      }
      setIsFetchingConfiguration(true);
      try {
        const configuration = await organizationServices.getSamlSsoConfiguration(orgId);
        if (!configuration) {
          return;
        }
        setSamlSsoConfiguration(configuration);
        setValue('domains', configuration.domains);
        setValue('rawIdpMetadataXml', configuration.rawIdpMetadataXml);
      } catch (error) {
        logger.logError({
          message: 'Error fetching SAML SSO configuration',
          error: error as Error,
        });
      } finally {
        setIsFetchingConfiguration(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchSamlSsoConfiguration();
  }, [isEdit, orgId, setValue, isOpen]);

  const isDisabledSubmit = useMemo(
    () => !formState.isValid || !formState.isDirty || isFetchingConfiguration,
    [formState.isValid, formState.isDirty, isFetchingConfiguration]
  );

  return (
    <Modal
      opened={isOpen}
      centered
      size="sm"
      cancelButtonProps={{
        title: t('common.cancel'),
      }}
      confirmButtonProps={{
        title: t('samlSso.samlSsoConfigurationModal.saveConfig'),
        type: 'submit',
        disabled: isDisabledSubmit,
      }}
      title={t('samlSso.samlSsoConfigurationModal.title')}
      message={t('samlSso.samlSsoConfigurationModal.description')}
      isProcessing={formState.isSubmitting}
      onConfirm={handleSubmit(onSubmit)}
      onClose={handleCloseModal}
      onCancel={handleCloseModal}
    >
      {isFetchingConfiguration ? (
        <Skeleton height={100} radius="md" />
      ) : (
        <div className={styles.formContainer}>
          <Collapse in={!!samlSsoConfiguration}>
            <TextInput
              size="lg"
              readOnly
              label={t('samlSso.samlSsoConfigurationModal.acsUrl')}
              autoComplete="off"
              rightSection={
                <IconButton
                  role="button"
                  size="sm"
                  tabIndex={-1}
                  icon={copiedFields.acsUrl ? 'check-md' : 'copy-md'}
                  onClick={() => handleCopy(samlSsoConfiguration?.ascUrl || '', 'acsUrl')}
                />
              }
              value={samlSsoConfiguration?.ascUrl}
            />
            <TextInput
              size="lg"
              readOnly
              label={t('samlSso.samlSsoConfigurationModal.spEntityId')}
              autoComplete="off"
              rightSection={
                <IconButton
                  role="button"
                  size="sm"
                  tabIndex={-1}
                  icon={copiedFields.spEntityId ? 'check-md' : 'copy-md'}
                  onClick={() => handleCopy(samlSsoConfiguration?.spEntityId || '', 'spEntityId')}
                />
              }
              value={samlSsoConfiguration?.spEntityId}
            />
          </Collapse>
          <Controller
            name="domains"
            control={control}
            render={({ field }) => (
              <TagsInput
                size="lg"
                label={t('samlSso.samlSsoConfigurationModal.emailDomains')}
                autoComplete="off"
                error={domainsErrorMessage}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="rawIdpMetadataXml"
            control={control}
            render={({ field }) => (
              <Textarea
                rows={6}
                label={t('samlSso.samlSsoConfigurationModal.rawIdpMetadataXml')}
                error={formState.errors.rawIdpMetadataXml?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      )}
    </Modal>
  );
};

export default SamlSsoConfigurationModal;
