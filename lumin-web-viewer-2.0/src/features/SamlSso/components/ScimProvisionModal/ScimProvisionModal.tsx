import { IconButton, Modal, Skeleton, TextInput } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useGetCurrentOrganization, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';

import { TIMEOUT } from 'constants/lumin-common';

import { ScimSsoConfiguration } from 'interfaces/organization/organization.interface';

import styles from './ScimProvisionModal.module.scss';

interface ScimProvisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScimProvisionModal = ({ isOpen, onClose }: ScimProvisionModalProps) => {
  const { t } = useTranslation();

  const { _id: orgId, sso } = useGetCurrentOrganization();

  const [isFetchingConfiguration, setIsFetchingConfiguration] = useState(false);
  const [scimSsoConfiguration, setScimSsoConfiguration] = useState<ScimSsoConfiguration | null>(null);

  const copyTimeout = useRef<NodeJS.Timeout | null>(null);
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({
    scimServerUrl: false,
    authorizationHeaderSecret: false,
  });

  const handleCopy = async (value: string, fieldName: keyof typeof copiedFields) => {
    await navigator.clipboard.writeText(value);
    setCopiedFields((prev) => ({ ...prev, [fieldName]: true }));
    toastUtils.success({ message: t('common.copiedToClipboard') }).finally(() => {});
    copyTimeout.current = setTimeout(() => {
      setCopiedFields((prev) => ({ ...prev, [fieldName]: false }));
    }, TIMEOUT.COPY);
  };

  const handleCloseModal = useCallback(() => {
    setScimSsoConfiguration(null);
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchSamlSsoConfiguration = async () => {
      if (!sso?.scimSsoClientId || !isOpen) {
        return;
      }
      setIsFetchingConfiguration(true);
      try {
        const configuration = await organizationServices.getScimSsoConfiguration(orgId);
        if (!configuration) {
          return;
        }
        setScimSsoConfiguration(configuration);
      } catch (error) {
        logger.logError({
          message: 'Error fetching SCIM SSO configuration',
          error: error as Error,
        });
      } finally {
        setIsFetchingConfiguration(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchSamlSsoConfiguration();
  }, [orgId, sso?.scimSsoClientId, isOpen]);

  return (
    <Modal
      opened={isOpen}
      centered
      size="sm"
      confirmButtonProps={{
        title: t('action.close'),
      }}
      title={t('scimProvision.scimProvisionConfigurationModal.title')}
      onConfirm={handleCloseModal}
      onClose={handleCloseModal}
    >
      {isFetchingConfiguration ? (
        <Skeleton height={100} radius="md" />
      ) : (
        <div className={styles.formContainer}>
          <TextInput
            size="lg"
            readOnly
            label={t('scimProvision.scimProvisionConfigurationModal.scimServerUrl')}
            autoComplete="off"
            rightSection={
              <IconButton
                role="button"
                size="sm"
                tabIndex={-1}
                icon={copiedFields.scimServerUrl ? 'check-md' : 'copy-md'}
                onClick={() => handleCopy(scimSsoConfiguration?.scimServerUrl || '', 'scimServerUrl')}
              />
            }
            value={scimSsoConfiguration?.scimServerUrl}
          />
          <TextInput
            size="lg"
            readOnly
            label={t('scimProvision.scimProvisionConfigurationModal.authorizationHeaderSecret')}
            autoComplete="off"
            rightSection={
              <IconButton
                role="button"
                size="sm"
                tabIndex={-1}
                icon={copiedFields.authorizationHeaderSecret ? 'check-md' : 'copy-md'}
                onClick={() =>
                  handleCopy(scimSsoConfiguration?.authorizationHeaderSecret || '', 'authorizationHeaderSecret')
                }
              />
            }
            value={scimSsoConfiguration?.authorizationHeaderSecret}
          />
        </div>
      )}
    </Modal>
  );
};

export default ScimProvisionModal;
