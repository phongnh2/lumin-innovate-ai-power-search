import { Avatar, Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import DefaultSelect from 'luminComponents/DefaultSelect';

import { useTranslation } from 'hooks';

import { getSlackChannels, getSlackRecipients } from 'services/graphServices/slack';

import logger from 'helpers/logger';

import { useAuthorize } from 'features/ShareInSlack/hooks/useAuthorize';
import { SlackTeam } from 'features/ShareInSlack/interfaces/slack.interface';
import {
  setChannels,
  setRecipients,
  setSelectedTeam,
  shareInSlackSelectors,
} from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

import { LOGGER } from 'constants/lumin-common';

import styles from './ShareInSlackForm.module.scss';

type TeamOption = {
  label: string;
  value: string;
  data: SlackTeam;
};

const mapTeamData = (team: SlackTeam): TeamOption => ({
  label: team.name,
  value: team.id,
  data: team,
});

const ADD_ANOTHER_WORKSPACE_VALUE = 'add-another-workspace';

const WorkspaceSelect = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const teams = useSelector(shareInSlackSelectors.getTeams);
  const selectedTeam = useSelector(shareInSlackSelectors.getSelectedTeam);

  const { handleAuthorize } = useAuthorize();

  const teamsOptionsData = useMemo(
    () => [
      ...teams.map(mapTeamData),
      {
        label: t('shareInSlack.addAnotherSlackWorkspace'),
        value: ADD_ANOTHER_WORKSPACE_VALUE,
      },
    ],
    [teams]
  );

  useEffect(() => {
    if (!selectedTeam) {
      return;
    }
    dispatch(setChannels([]));
    dispatch(setRecipients([]));
    const getChannelsAndRecipients = async () => {
      try {
        const [channels, recipients] = await Promise.all([
          getSlackChannels(selectedTeam.id),
          getSlackRecipients(selectedTeam.id),
        ]);
        dispatch(setChannels(channels));
        dispatch(setRecipients(recipients));
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.SHARE_IN_SLACK,
          error: error as Error,
          message: 'Error fetching channels and recipients',
        });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getChannelsAndRecipients();
  }, [selectedTeam]);

  useEffect(() => {
    dispatch(setSelectedTeam(teams[0]));
  }, []);

  const handleSelect = async (option: TeamOption) => {
    if (option.value === ADD_ANOTHER_WORKSPACE_VALUE) {
      await handleAuthorize();
      return;
    }
    dispatch(setSelectedTeam(option.data));
  };

  const renderOption = ({ option }: { option: TeamOption }) => (
    <div className={styles.optionContainer}>
      {option.value === ADD_ANOTHER_WORKSPACE_VALUE ? (
        <div className={styles.optionInfo}>
          <span className={styles.channelIcon}>
            <Icomoon type="plus-md" size="md" />
          </span>
          <Text ellipsis>{option.label}</Text>
        </div>
      ) : (
        <div className={styles.optionInfo}>
          <Avatar src={option.data.avatar} size="xs" name={option.label} variant="outline" />
          <Text ellipsis>{option.label}</Text>
        </div>
      )}
      {selectedTeam?.id === option.value && <Icomoon type="check-sm" size="sm" />}
    </div>
  );

  return (
    <DefaultSelect
      data={teamsOptionsData}
      label={t('shareInSlack.selectSlackWorkspace')}
      size="lg"
      renderOption={renderOption}
      onChange={(_, option) => handleSelect(option as TeamOption)}
      value={selectedTeam?.id}
      nothingFoundMessage={t('searchDocument.noResult')}
      leftSection={<Avatar src={selectedTeam?.avatar} size="xs" name={selectedTeam?.name} variant="outline" />}
      classNames={{
        option: styles.option,
        dropdown: styles.dropdown,
      }}
      scrollAreaProps={{
        classNames: {
          viewport: styles.viewport,
        },
      }}
    />
  );
};

export default WorkspaceSelect;
