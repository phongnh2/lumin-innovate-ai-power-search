import { TFunction } from 'i18next';
import { Icomoon, PlainTooltip, Skeleton, Text, Collapse } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DefaultSelect from 'luminComponents/DefaultSelect';

import { useTranslation } from 'hooks';

import { isDriveOnlyUser } from 'utils/restrictedUserUtil';

import { SharingMode } from 'features/ShareInSlack/constants';
import { SlackChannel, SlackRecipient } from 'features/ShareInSlack/interfaces/slack.interface';
import {
  setSelectedDestination as setSelectedDestinationAction,
  shareInSlackSelectors,
} from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

import styles from './ShareInSlackForm.module.scss';

type Option = {
  label: string;
  value: string;
  data: SlackChannel | SlackRecipient;
  disabled?: boolean;
};

const mapChannelData = (channel: SlackChannel): Option => ({
  label: channel.name,
  value: channel.id,
  data: {
    ...channel,
    isChannel: true,
  },
});

const memberName = (recipient: SlackRecipient) => {
  const { name, displayName } = recipient;
  if (displayName) {
    return `${name} (@${displayName})`;
  }
  return name;
};

const mapRecipientData = (recipient: SlackRecipient): Option => ({
  label: memberName(recipient),
  value: recipient.id,
  data: recipient,
  disabled: isDriveOnlyUser(recipient.email),
});

const skeletonData = (t: TFunction) => [
  {
    group: t('shareInSlack.channels'),
    items: Array.from({ length: 3 }, (_, index) => ({
      label: `channel`,
      value: `channel ${index + 1}`,
      data: null as SlackChannel,
    })),
  },
  {
    group: t('shareInSlack.directMessages'),
    items: Array.from({ length: 3 }, (_, index) => ({
      label: `recipient`,
      value: `recipient ${index + 1}`,
      data: null as SlackRecipient,
    })),
  },
];

const DestinationSelect = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const channels = useSelector(shareInSlackSelectors.getChannels);
  const recipients = useSelector(shareInSlackSelectors.getRecipients);
  const selectedDestination = useSelector(shareInSlackSelectors.getSelectedDestination);
  const selectedTeam = useSelector(shareInSlackSelectors.getSelectedTeam);
  const sharingMode = useSelector(shareInSlackSelectors.getSharingMode);

  const [searchValue, setSearchValue] = useState('');
  const [shoudDisplayLeftSection, setShoudDisplayLeftSection] = useState(true);

  const setSelectedDestination = useCallback((data: SlackChannel | SlackRecipient | null) => {
    setShoudDisplayLeftSection(Boolean(data?.isChannel));
    dispatch(setSelectedDestinationAction(data));
  }, []);

  const handleSelect = (option: Option) => {
    if (option.data) {
      setSelectedDestination(option.data);
    }
  };

  const data = useMemo(() => {
    if (channels.length === 0 && recipients.length === 0) {
      return skeletonData(t);
    }
    return [
      {
        group: t('shareInSlack.channels'),
        items: channels.map(mapChannelData),
      },
      {
        group: t('shareInSlack.directMessages'),
        items: recipients.map(mapRecipientData),
      },
    ];
  }, [channels, recipients]);

  useEffect(() => {
    setSelectedDestination(null);
  }, [selectedTeam]);

  const renderOptionInner = useCallback(({ option }: { option: Option }) => {
    if (option.data === null) {
      const isChannel = option.label === 'channel';
      return (
        <>
          {isChannel && (
            <span className={styles.channelIcon}>
              <Skeleton width={16} height={16} radius="sm" />
            </span>
          )}
          <Skeleton className={isChannel ? '' : styles.optionLabel} width={200} height={16} radius="sm" />
        </>
      );
    }
    return (
      <>
        {option.data?.isChannel && (
          <span className={styles.channelIcon}>
            <Icomoon type={(option.data as SlackChannel).isPrivate ? 'shared-private-md' : 'mark-md'} size="md" />
          </span>
        )}
        <Text ellipsis className={option.data?.isChannel ? '' : styles.optionLabel}>
          {option.label}
        </Text>
      </>
    );
  }, []);

  const renderOption = useCallback(
    ({ option }: { option: Option }) => (
      <PlainTooltip
        content={option.disabled ? t('modalShare.cannotShareDocumentWithUser') : ''}
        position="top"
        offset={-22}
      >
        <div className={styles.optionContainer}>
          <div className={styles.optionInfo}>{renderOptionInner({ option })}</div>
          {selectedDestination?.id === option.value && <Icomoon type="check-sm" size="sm" />}
        </div>
      </PlainTooltip>
    ),
    [selectedDestination?.id]
  );

  const leftSection = useMemo(() => {
    if (!selectedDestination?.isChannel) {
      return null;
    }
    return (
      <Icomoon type={(selectedDestination as SlackChannel).isPrivate ? 'shared-private-md' : 'mark-md'} size="md" />
    );
  }, [selectedDestination]);

  const onSearchChange = (value: string) => {
    setSearchValue(value);
    if (!value.length && selectedDestination?.isChannel) {
      setShoudDisplayLeftSection(false);
    }
  };

  const onOptionSubmit = (value: string) => {
    if (selectedDestination && selectedDestination.id === value && selectedDestination.name !== searchValue) {
      if (selectedDestination.isChannel) {
        setSearchValue(selectedDestination.name);
        setShoudDisplayLeftSection(true);
      } else {
        setSearchValue(memberName(selectedDestination as SlackRecipient));
      }
    }
  };

  const selectionWarning = useMemo(() => {
    if (!selectedDestination || (selectedDestination.isChannel && !(selectedDestination as SlackChannel).isPrivate)) {
      return '';
    }

    if (!selectedDestination.isChannel) {
      return t('shareInSlack.directMessageSelectionWarning');
    }

    return sharingMode === SharingMode.ANYONE
      ? t('shareInSlack.privateChannelAndPublicModeSelectionWarning')
      : t('shareInSlack.privateChannelAndPrivateModeSelectionWarning');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDestination, sharingMode]);

  return (
    <>
      <DefaultSelect
        data={data}
        label={t('shareInSlack.selectDestination')}
        searchable
        size="lg"
        placeholder={t('common.eg', { egText: 'Lumin' })}
        value={selectedDestination?.id || null}
        onChange={(_, option) => handleSelect(option as Option)}
        renderOption={renderOption}
        leftSection={shoudDisplayLeftSection && leftSection}
        classNames={{
          groupLabel: styles.groupLabel,
          option: styles.option,
          dropdown: styles.dropdown,
        }}
        scrollAreaProps={{
          mah: 256,
          classNames: {
            viewport: styles.viewport,
          },
        }}
        nothingFoundMessage={<p className={styles.nothingFoundMessage}>{t('searchDocument.noResult')}</p>}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onBlur={() => setShoudDisplayLeftSection(Boolean(selectedDestination?.isChannel))}
        onOptionSubmit={onOptionSubmit}
      />
      <Collapse in={Boolean(selectionWarning)} className={styles.privateChannelWarning}>
        <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
          {selectionWarning}
        </Text>
      </Collapse>
    </>
  );
};

export default DestinationSelect;
