import { Paper } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useEnableWebReskin } from 'hooks';

import ThemeProvider from 'theme-providers';

import * as Styled from './FullRequestList.styled';

import styles from './FullRequestList.module.scss';

type Props = {
  children: JSX.Element;
  closeFullList: () => void;
  titleComponent: JSX.Element;
};

const FullRequestList = ({ children, titleComponent }: Props): JSX.Element => {
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <Paper shadow="lg" radius="lg" className={styles.container}>
        {titleComponent}
        {children}
      </Paper>
    );
  }

  return (
    <ThemeProvider.RequestAccessList>
      <Styled.Container>
        <Styled.Header>{titleComponent}</Styled.Header>
        {children}
      </Styled.Container>
    </ThemeProvider.RequestAccessList>
  );
};

export default FullRequestList;
