import { Icomoon, Text, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import IconFolderBasic from 'assets/images/icon-folder-basic.svg';

import { useEnableWebReskin } from 'hooks';

import { TOOLTIP_MAX_WIDTH, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';

import * as Styled from './ResultItemRender.styled';

import styles from './ResultItemRender.module.scss';

interface FolderSearchResultProps {
  title: string;
  text?: string;
  goToDestination: () => void;
}

const FolderSearchResult = ({ title, text = '', goToDestination }: FolderSearchResultProps): JSX.Element => {
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <div role="presentation" onClick={goToDestination} className={styles.itemWrapper}>
        <Icomoon size="lg" type="folder-lg" color="var(--kiwi-colors-surface-on-surface)" />
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
      <Styled.IconFolder src={IconFolderBasic} alt={title} />
      <div>
        <Styled.Title>{title}</Styled.Title>
        {text && <Styled.Text>{text}</Styled.Text>}
      </div>
    </Styled.ResultItem>
  );
};

export default FolderSearchResult;
