import { Button, Modal } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { updateCurrentUser } from 'actions/authActions';

import { useGetCurrentOrganization, useGetCurrentTeam, useGetCurrentUser, useTranslation } from 'hooks';

import { userServices } from 'services';
import { authService } from 'services/authServices';
import { kratosService } from 'services/oryServices';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { STATIC_PAGE_URL } from 'constants/urls';

import { ITeam } from 'interfaces/team/team.interface';

import styles from './NewPrivacyPolicyModal.module.scss';

const NewPrivacyPolicyModal = () => {
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const { t } = useTranslation();
  const currentOrganization = useGetCurrentOrganization();
  const currentTeam = useGetCurrentTeam() as ITeam;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const { user } = await userServices.acceptNewTermsOfUse(
        currentOrganization?._id ? { orgId: currentOrganization._id, teamId: currentTeam?._id } : undefined
      );
      dispatch(
        updateCurrentUser({
          metadata: { acceptedTermsOfUseVersion: user.metadata.acceptedTermsOfUseVersion },
          isTermsOfUseVersionChanged: false,
        })
      );
    } catch (error) {
      logger.logError({
        reason: 'Accept new Privacy Policy',
        message: 'Failed to accept new Privacy Policy',
        error: error as Error,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessingCancel(true);
      await kratosService.signOut(() => {
        logger.logInfo({
          message: LOGGER.EVENT.SIGN_OUT,
          reason: LOGGER.Service.KRATOS_INFO,
        });
        authService.afterSignOut();
      });
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.KRATOS_ERROR,
        error: error as Error,
      });
    } finally {
      setIsProcessingCancel(false);
    }
  };

  if (process.env.DISABLE_NEW_TERMS_MODAL === 'true' || !currentUser?.isTermsOfUseVersionChanged) {
    return null;
  }

  return (
    <Modal
      opened
      onClose={() => {}}
      closeOnClickOutside={false}
      zIndex="var(--zindex-modal-high)"
      closeOnEscape={false}
      style={{
        '--modal-size': '560px',
      }}
      title={t('newPrivacyPolicyModal.title')}
    >
      <p className={styles.description}>{t('newPrivacyPolicyModal.description1')}</p>
      <div className={styles.keyChangesContainer}>
        <p className={styles.keyChangesTitle}>{t('newPrivacyPolicyModal.keyChanges')}</p>
        <ul className={styles.keyChangesList}>
          {(t('newPrivacyPolicyModal.keyChangesList', { returnObjects: true }) as unknown as string[]).map(
            (item: string) => (
              <li key={item} className={styles.keyChangesItem}>
                {item}
              </li>
            )
          )}
        </ul>
      </div>
      <p className={styles.description}>
        <Trans
          i18nKey="newPrivacyPolicyModal.description2"
          components={{
            a: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
              <a
                className={styles.termsLink}
                target="_blank"
                href={`${STATIC_PAGE_URL}${Routers.TERMS_OF_USE}`}
                rel="noopener noreferrer"
              />
            ),
          }}
        />
      </p>
      <div className={styles.bottomContainer}>
        <Button
          variant="text"
          onClick={handleCancel}
          size="lg"
          className={styles.cancelButtonWrapper}
          loading={isProcessingCancel}
          disabled={isProcessing}
        >
          {t('newPrivacyPolicyModal.logInAnotherAccount')}
        </Button>
        <Button onClick={handleConfirm} loading={isProcessing} size="lg" disabled={isProcessingCancel}>
          {t('newPrivacyPolicyModal.accept')}
        </Button>
      </div>
    </Modal>
  );
};

export default NewPrivacyPolicyModal;
