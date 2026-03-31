/* eslint-disable arrow-body-style */
import React from 'react';
import { ThemeProvider, useTheme } from 'styled-components';

import * as Styled from './TabList.styled';

const TabsList = React.forwardRef((props, ref) => {
  const { themeMode } = useTheme();
  const themeProvider = Styled.tabListTheme[themeMode];

  return (
    <ThemeProvider theme={themeProvider}>
      <Styled.TabsList {...props} ref={ref} />
    </ThemeProvider>
  );
});

export default TabsList;
