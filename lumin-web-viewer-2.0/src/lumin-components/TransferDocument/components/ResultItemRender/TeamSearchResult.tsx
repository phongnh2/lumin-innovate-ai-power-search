/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Avatar, Text, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { useEnableWebReskin } from 'hooks';

import { TOOLTIP_OPEN_DELAY, TOOLTIP_MAX_WIDTH } from 'constants/lumin-common';

import * as Styled from './ResultItemRender.styled';

import styles from './ResultItemRender.module.scss';

interface TeamSearchResultProps {
  avatarSrc: string;
  avatarDefault: string;
  title: string;
  goToDestination: () => void;
}

const TeamSearchResult = ({ avatarSrc, avatarDefault, title, goToDestination }: TeamSearchResultProps): JSX.Element => {
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <div role="presentation" onClick={goToDestination} className={styles.itemWrapper}>
        <Avatar variant="outline" size="xs" src={avatarSrc} name={avatarDefault} alt="Space Avatar" />
        <PlainTooltip
          openDelay={TOOLTIP_OPEN_DELAY}
          maw={TOOLTIP_MAX_WIDTH}
          className={styles.tooltipWrapper}
          content={title}
        >
          <Text size="md" type="body" color="var(--kiwi-colors-surface-on-surface)" ellipsis>
            {title}
          </Text>
        </PlainTooltip>
      </div>
    );
  }

  return (
    <Styled.ResultItem onClick={goToDestination}>
      <MaterialAvatar src={avatarSrc} hasBorder size={24} secondary={typeof avatarDefault !== 'string'}>
        {avatarDefault}
      </MaterialAvatar>
      <Styled.Title>{title}</Styled.Title>
    </Styled.ResultItem>
  );
};

export default TeamSearchResult;
