import React, { useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useGetCurrentUser, useTranslation } from 'hooks';

import { getSlackTeams } from 'services/graphServices/slack';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';

import { LOGGER, ModalTypes } from 'constants/lumin-common';

import { SlackOAuthErrorType } from '../constants';
import { setSelectedTeam, setTeams } from '../reducer/ShareInSlack.reducer';
import styles from '../ShareInSlackModal.module.scss';
import slackService from '../utils/SlackService';

export const useAuthorize = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser() || { email: '' };
  const [isLoading, setIsLoading] = useState(false);

  const onSuccess = useCallback(
    async ({ teamId }: { teamId?: string }) => {
      try {
        const teams = await getSlackTeams();
        dispatch(setTeams(teams));
        if (teamId) {
          dispatch(setSelectedTeam(teams.find((team) => team.id === teamId)));
        }
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.SHARE_IN_SLACK,
          error: error as Error,
          message: 'Error fetching teams',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  const onError = useCallback(
    ({ errorType }: { errorType: SlackOAuthErrorType }) => {
      setIsLoading(false);
      logger.logInfo({
        reason: LOGGER.Service.SHARE_IN_SLACK,
        message: 'Error authorizing Slack',
        attributes: {
          errorType,
        },
      });
      if (errorType === SlackOAuthErrorType.DIFFERENT_EMAIL_ADDRESS) {
        dispatch(
          actions.openModal({
            type: ModalTypes.ERROR,
            title: t('shareInSlack.cannotShareFile'),
            message: (
              <div>
                <Trans
                  i18nKey="shareInSlack.differentEmailAddress"
                  values={{ email: currentUser.email }}
                  components={{ b: <b className={styles.email} /> }}
                />
              </div>
            ),
            useReskinModal: true,
            confirmButtonProps: {
              withExpandedSpace: true,
            },
            confirmButtonTitle: t('action.ok'),
            cancelButtonTitle: '',
          })
        );
        return;
      }
      if (errorType === SlackOAuthErrorType.CANCELLED_BY_USER) {
        toastUtils.error({ message: t('openDrive.accessDenied') });
        return;
      }
      toastUtils.error({ message: t('common.somethingWentWrong') });
    },
    [currentUser]
  );

  const handleAuthorize = async () => {
    setIsLoading(true);
    await slackService.getConsent({ onSuccess, onError });
  };

  return { handleAuthorize, isLoading };
};
