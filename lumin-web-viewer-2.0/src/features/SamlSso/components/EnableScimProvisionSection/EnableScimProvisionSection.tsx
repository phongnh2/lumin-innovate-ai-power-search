import produce, { Draft } from 'immer';
import { Button } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import QuestionPanel from 'luminComponents/QuestionPanel';

import { useGetCurrentOrganization } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';

import { ScimProvisionSectionData } from 'features/SamlSso/interfaces/scimProvision.interface';

import { HELP_CENTER_URL } from 'constants/customConstant';
import { LOGGER, ModalTypes } from 'constants/lumin-common';

import { ScimProvisionModal } from '../ScimProvisionModal';

import styles from './EnableScimProvisionSection.module.scss';

const EnableScimProvisionSection = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { _id: orgId, sso } = useGetCurrentOrganization();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const [scimProvisionData, updateScimProvisionData] = useState<ScimProvisionSectionData>({
    title: t('orgDashboardSecurity.scimProvisionSection.title'),
    options: [
      {
        title: t('orgDashboardSecurity.scimProvisionSection.subtitle'),
        subtitle: (
          <Trans
            i18nKey="orgDashboardSecurity.scimProvisionSection.description"
            components={{
              Link: (
                // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                <a
                  className={styles.learnMore}
                  href={`${HELP_CENTER_URL}/how-do-i-set-up-google-sign-in`}
                  target="_blank"
                  rel="noreferrer"
                />
              ),
            }}
          />
        ),
        question: {
          type: 'SWITCH',
          field: {
            key: 'scimSso',
            value: !!sso?.scimSsoClientId,
          },
          dependents: [],
        },
        viewButton: (
          <Button variant="tonal" onClick={() => setIsOpenModal(true)}>
            {t('orgDashboardSecurity.scimProvisionSection.viewButton')}
          </Button>
        ),
      },
    ],
    permission: {
      isAllow: true,
      disallowedReason: t('orgDashboardSecurity.disallowDifferentDomain'),
      requiredUpgrade: false,
    },
  });

  const handleUpdateScimProvisionData = useCallback(
    (value: boolean) => {
      const updatedData = produce(scimProvisionData, (draft) => {
        draft.options[0].question.field.value = value;
      });
      updateScimProvisionData(updatedData);
    },
    [scimProvisionData]
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updatePermissionData = (draft: Draft<ScimProvisionSectionData>) => {
      draft.permission.isAllow = false;
      draft.options[0].question.field.value = false;
      draft.options[0].question.disabled = true;
    };

    try {
      setIsLoading(true);
      let updatedData = scimProvisionData;
      if (!sso?.ssoOrganizationId) {
        updatedData = produce(updatedData, (draft) => {
          updatePermissionData(draft);
          draft.permission.disallowedReason = '';
        });
      } else {
        updatedData = produce(updatedData, (draft) => {
          draft.permission.isAllow = true;
          draft.options[0].question.disabled = false;
        });
      }
      updateScimProvisionData(updatedData);
    } finally {
      setIsLoading(false);
    }
  }, [sso?.ssoOrganizationId]);

  const [isEnabling, setIsEnabling] = useState(false);

  // enable SCIM provision
  const enableScimProvision = async () => {
    setIsEnabling(true);
    try {
      const data = await organizationServices.enableScimSsoProvision(orgId);
      await toastUtils.success({ message: t('scimProvision.toastEnabledSuccessMessage') });
      handleUpdateScimProvisionData(true);
      dispatch(actions.updateCurrentOrganization({ sso: { ...sso, scimSsoClientId: data.id } }));
      setIsOpenModal(true);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.ENABLE_SCIM_PROVISION,
        message: 'Enable SCIM provision failed',
        error: error as Error,
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const onDisableScimProvision = async () => {
    try {
      dispatch(
        actions.updateModalProperties({
          isProcessing: true,
        })
      );
      await organizationServices.disableScimSsoProvision(orgId);
      handleUpdateScimProvisionData(false);
      dispatch(actions.updateCurrentOrganization({ sso: { ...sso, scimSsoClientId: null } }));
      toastUtils.success({ message: t('scimProvision.disableScimProvision.toastMessage') }).finally(() => {});
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.DISABLE_SCIM_PROVISION,
        message: 'Disable SCIM provision failed',
        error: error as Error,
      });
    } finally {
      dispatch(actions.closeModal());
    }
  };

  // disable SCIM provision
  const showConfirmDisableScimProvision = () => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      cancelButtonTitle: t('common.cancel'),
      closeOnConfirm: false,
      onConfirm: () => onDisableScimProvision(),
      onCancel: () => {},
      useReskinModal: true,
      title: t('scimProvision.disableScimProvision.title'),
      message: (
        <Trans
          i18nKey="scimProvision.disableScimProvision.message"
          components={{ b: <b className="kiwi-message--primary" /> }}
        />
      ),
      confirmButtonTitle: t('common.disable'),
    };
    dispatch(actions.openModal(modalSettings));
  };

  const toggleScimProvision = ({ value }: { value: boolean }) =>
    value ? enableScimProvision() : showConfirmDisableScimProvision();

  return (
    <>
      <QuestionPanel section={scimProvisionData} updateData={toggleScimProvision} loading={isLoading || isEnabling} />
      <ScimProvisionModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} />
    </>
  );
};

export default EnableScimProvisionSection;
