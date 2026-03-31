import { Paper, Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SlackLogo from 'assets/reskin/lumin-svgs/slack-logo.svg';

import Loading from 'luminComponents/Loading';
import Title from 'luminComponents/ShareModal/components/Title';

import { useTranslation } from 'hooks';

import { getSlackTeams } from 'services/graphServices/slack';

import logger from 'helpers/logger';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { LOGGER } from 'constants/lumin-common';

import { setTeams, shareInSlackSelectors, resetForm, resetSlackStates } from './reducer/ShareInSlack.reducer';

import styles from './ShareInSlackModal.module.scss';

const SignInWithSlack = lazyWithRetry(() => import('./components/SignInWithSlack'));
const ShareInSlackForm = lazyWithRetry(() => import('./components/ShareInSlackForm'));

function ShareInSlackModal({ onClose = () => {} }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const teams = useSelector(shareInSlackSelectors.getTeams);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTeams = async () => {
      setIsLoading(true);
      try {
        const slackTeams = await getSlackTeams();
        if (slackTeams?.length) {
          dispatch(setTeams(slackTeams));
        }
      } catch (error) {
        logger.logInfo({
          reason: LOGGER.Service.SHARE_IN_SLACK,
          message: 'Error fetching teams',
          error: error as Error,
        });
      } finally {
        setIsLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getTeams();
  }, []);

  useEffect(
    () => () => {
      dispatch(resetForm());
      dispatch(resetSlackStates());
    }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <Loading normal />
        </div>
      );
    }
    if (!teams?.length) {
      return <SignInWithSlack onClose={onClose} />;
    }
    return <ShareInSlackForm onClose={onClose} />;
  };

  return (
    <Paper elevation="lg" radius="lg" className={styles.container}>
      <Title
        onBack={onClose}
        showBackButton
        hasPermission={false}
        titleElement={
          <div className={styles.titleWrapper}>
            <Text type="headline" size="lg">
              {t('modalShare.shareInSlack')}
            </Text>
            <img src={SlackLogo} alt="share-in-slack" />
          </div>
        }
      />
      <div className={styles.contentWrapper}>{renderContent()}</div>
    </Paper>
  );
}

export default ShareInSlackModal;
