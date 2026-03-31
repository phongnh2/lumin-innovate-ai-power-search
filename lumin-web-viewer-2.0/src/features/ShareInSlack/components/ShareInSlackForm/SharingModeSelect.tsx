import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import DefaultSelect from 'luminComponents/DefaultSelect';

import { useTranslation } from 'hooks';

import { countSlackChannelMembers } from 'services/graphServices/slack';

import logger from 'helpers/logger';

import { SharingMode } from 'features/ShareInSlack/constants';
import { SlackChannel, SlackSharingMode } from 'features/ShareInSlack/interfaces/slack.interface';
import {
  setSharingMode,
  setTotalMembers,
  shareInSlackSelectors,
} from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

import { LOGGER } from 'constants/lumin-common';
import { MAX_CAPACITY_FOR_PRIVATE_SHARING } from 'constants/urls';

import styles from './ShareInSlackForm.module.scss';

type Option = {
  value: SlackSharingMode;
  label: string;
  data: {
    icon: string;
  };
};

const SharingModeSelect = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sharingMode = useSelector(shareInSlackSelectors.getSharingMode);
  const selectedDestination = useSelector(shareInSlackSelectors.getSelectedDestination);
  const selectedTeam = useSelector(shareInSlackSelectors.getSelectedTeam);
  const [readOnly, setReadOnly] = useState(false);

  const sharingModeOptions = [
    {
      label: t('shareInSlack.shareWithSlackChannelMembersUserOnly'),
      value: SharingMode.INVITED,
      data: {
        icon: 'shared-private-md',
      },
    },
    {
      label: t('shareInSlack.publicLinkAccessForAnyone'),
      value: SharingMode.ANYONE,
      data: {
        icon: 'world-md',
      },
    },
  ];

  useEffect(() => {
    if (!selectedDestination) {
      return;
    }
    setReadOnly(false);
    if (!selectedDestination?.isChannel) {
      dispatch(setSharingMode(SharingMode.INVITED));
      return;
    }
    // Some slack channels don't have totalMembers
    if (!(selectedDestination as SlackChannel)?.totalMembers) {
      countSlackChannelMembers(selectedTeam.id, selectedDestination.id)
        .then((totalMembers) => {
          dispatch(setTotalMembers(totalMembers));
          if (totalMembers > MAX_CAPACITY_FOR_PRIVATE_SHARING) {
            dispatch(setSharingMode(SharingMode.ANYONE));
            setReadOnly(true);
            return;
          }
          dispatch(setSharingMode(SharingMode.INVITED));
        })
        .catch((error: Error) => {
          dispatch(setSharingMode(SharingMode.ANYONE));
          setReadOnly(true);
          logger.logError({
            reason: LOGGER.Service.SHARE_IN_SLACK,
            message: 'Error checking public document sharing',
            error,
          });
        });
      return;
    }
    if ((selectedDestination as SlackChannel)?.totalMembers > MAX_CAPACITY_FOR_PRIVATE_SHARING) {
      dispatch(setSharingMode(SharingMode.ANYONE));
      setReadOnly(true);
      return;
    }
    dispatch(setSharingMode(SharingMode.INVITED));
  }, [selectedDestination]);

  const handleSelect = (option: Option) => {
    dispatch(setSharingMode(option.value));
  };

  const renderOption = ({ option }: { option: Option }) => (
    <div className={styles.optionContainer}>
      <div className={styles.optionInfo}>
        <Icomoon type={option.data.icon} size="md" />
        <Text ellipsis>{option.label}</Text>
      </div>
      {sharingMode === option.value && <Icomoon type="check-sm" size="sm" />}
    </div>
  );

  const leftSection = useMemo(
    () => <Icomoon type={sharingMode === SharingMode.INVITED ? 'shared-private-md' : 'world-md'} size="md" />,
    [sharingMode]
  );

  return (
    <DefaultSelect
      data={sharingModeOptions}
      label={t('shareInSlack.sharingMode')}
      size="lg"
      renderOption={renderOption}
      onChange={(_, option) => handleSelect(option as Option)}
      value={sharingMode}
      readOnly={!selectedDestination || readOnly}
      leftSection={leftSection}
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

export default SharingModeSelect;
