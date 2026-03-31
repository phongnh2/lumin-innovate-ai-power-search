import { Modal, Button } from '@kiwi-ui';
import axios from 'axios';
import { Trans } from 'next-i18next';
import { useState } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';

import { environment } from '@/configs/environment';
import { updateCurrentUser } from '@/features/account/user-slice';
import useTranslation from '@/hooks/useTranslation';
import { useAppSelector } from '@/lib/hooks';
import { logger } from '@/lib/logger';
import sessionManagement from '@/lib/session';
import { getCurrentUser } from '@/selectors';

import useClickLogout from '../ProfileDropdown/useClickLogout';

import styles from './NewPrivacyPolicyModal.module.scss';

const NewPrivacyPolicyModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [logout] = useClickLogout();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  const currentUser = useAppSelector(getCurrentUser, shallowEqual);

  if (!currentUser?.isTermsOfUseVersionChanged) {
    return null;
  }

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const token = await sessionManagement.getAuthorizeToken();
      const headers: Record<string, string> = {};

      if (token) {
        headers['authorization-v2'] = `Bearer ${token}`;
      }

      await axios.post(
        environment.public.host.backendUrl + '/user/accept-new-terms-of-use',
        {},
        {
          withCredentials: true,
          headers
        }
      );
      dispatch(updateCurrentUser({ isTermsOfUseVersionChanged: false }));
    } catch (error) {
      logger.error({
        message: 'Error accept New Privacy Policy Banner',
        err: error as unknown as Error,
        scope: 'accept-new-terms-of-use'
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCancel = () => {
    setIsProcessingCancel(true);
    logout();
  };

  return (
    <Modal
      opened
      onClose={handleCancel}
      closeOnClickOutside={false}
      zIndex='var(--zindex-modal-medium)'
      closeOnEscape={false}
      style={{
        '--modal-size': '560px'
      }}
      title={t('newPrivacyPolicyModal.title')}
    >
      <p className={styles.description}>{t('newPrivacyPolicyModal.description1')}</p>
      <div className={styles.keyChangesContainer}>
        <p className={styles.keyChangesTitle}>{t('newPrivacyPolicyModal.keyChanges')}</p>
        <ul className={styles.keyChangesList}>
          {(t('newPrivacyPolicyModal.keyChangesList', { returnObjects: true }) as unknown as string[]).map((item: string) => (
            <li key={item} className={styles.keyChangesItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.description}>
        <Trans
          i18nKey='newPrivacyPolicyModal.description2'
          components={{
            a: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
              <a className={styles.termsLink} target='_blank' href={`${environment.public.host.staticUrl}/terms-of-use`} rel='noopener noreferrer' />
            )
          }}
        />
      </p>
      <div className={styles.bottomContainer}>
        <Button variant='text' onClick={handleCancel} size='lg' className={styles.cancelButtonWrapper} loading={isProcessingCancel} disabled={isAccepting}>
          {t('newPrivacyPolicyModal.logInAnotherAccount')}
        </Button>
        <Button onClick={handleAccept} loading={isAccepting} size='lg' disabled={isProcessingCancel}>
          {t('newPrivacyPolicyModal.accept')}
        </Button>
      </div>
    </Modal>
  );
};

export default NewPrivacyPolicyModal;
