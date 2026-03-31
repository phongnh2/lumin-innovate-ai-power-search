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

import { HELP_CENTER_URL } from 'constants/customConstant';
import { ModalTypes } from 'constants/lumin-common';

import { SamlSsoSectionData } from '../../interfaces/samlSsoConfiguration.interface';
import { SamlSsoConfigurationModal } from '../SamlSsoConfigurationModal';

import styles from './EnableSamlSsoSection.module.scss';

const EnableSamlSsoSection = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { _id: orgId, associateDomains, sso } = useGetCurrentOrganization();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isViewConfiguration, setIsViewConfiguration] = useState(false);

  useEffect(() => {
    if (!sso) {
      setIsViewConfiguration(false);
    }
  }, [sso]);

  const [samlSsoData, updateSamlSsoData] = useState<SamlSsoSectionData>({
    options: [
      {
        title: t('orgDashboardSecurity.samlSsoSection.subtitle'),
        subtitle: (
          <Trans
            i18nKey="orgDashboardSecurity.samlSsoSection.description"
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
            key: 'samlSso',
            value: !!sso?.ssoOrganizationId,
          },
          dependents: [],
        },
        viewButton: (
          <Button
            variant="tonal"
            onClick={() => {
              setIsViewConfiguration(true);
              setIsOpenModal(true);
            }}
          >
            {t('orgDashboardSecurity.samlSsoSection.viewButton')}
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

  const handleUpdateSamlSsoData = useCallback(
    (value: boolean) => {
      const updatedData = produce(samlSsoData, (draft) => {
        draft.options[0].question.field.value = value;
      });
      updateSamlSsoData(updatedData);
    },
    [samlSsoData]
  );

  const handleDeleteSamlSsoConfiguration = useCallback(async () => {
    try {
      dispatch(
        actions.updateModalProperties({
          isProcessing: true,
        })
      );
      await organizationServices.deleteSamlSsoConfiguration(orgId);
      dispatch(
        actions.updateCurrentOrganization({
          sso: null,
        })
      );
      toastUtils.success({ message: t('samlSso.disableSamlSso.toastMessage') }).finally(() => {});
      handleUpdateSamlSsoData(false);
    } catch (error) {
      logger.logError({
        message: 'Error in EnableSamlSsoSection',
        error: error as Error,
      });
    } finally {
      dispatch(actions.closeModal());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, samlSsoData]);

  const handleChange = ({ value }: { value: boolean }) => {
    if (value) {
      setIsOpenModal(true);
    } else {
      const modalSettings = {
        type: ModalTypes.WARNING,
        cancelButtonTitle: t('common.cancel'),
        closeOnConfirm: false,
        onConfirm: () => handleDeleteSamlSsoConfiguration(),
        onCancel: () => {},
        useReskinModal: true,
        title: t('samlSso.disableSamlSso.title'),
        message: (
          <Trans i18nKey="samlSso.disableSamlSso.message" components={{ b: <b className="kiwi-message--primary" /> }} />
        ),
        confirmButtonTitle: t('common.disable'),
      };
      dispatch(actions.openModal(modalSettings));
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updatePermissionData = (draft: Draft<SamlSsoSectionData>) => {
      draft.permission.isAllow = false;
      draft.options[0].question.field.value = false;
      draft.options[0].question.disabled = true;
    };

    try {
      setIsLoading(true);
      let updatedData = samlSsoData;

      if (!associateDomains.length) {
        // organization without associated domain;
        updatedData = produce(updatedData, (draft) => {
          draft.permission.disallowedReason = t('orgDashboardSecurity.disallowForOrgHasNotAssociatedDomain');
          updatePermissionData(draft);
        });
      }
      updateSamlSsoData(updatedData);
    } finally {
      setIsLoading(false);
    }
  }, [associateDomains]);

  return (
    <>
      <QuestionPanel section={samlSsoData} updateData={handleChange} loading={isLoading} />
      <SamlSsoConfigurationModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSuccess={() => handleUpdateSamlSsoData(true)}
        isEdit={isViewConfiguration}
      />
    </>
  );
};

export default EnableSamlSsoSection;
