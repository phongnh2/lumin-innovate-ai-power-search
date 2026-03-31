import React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';
import { useThemeMode } from 'hooks';

const THEMES = {
  [THEME_MODE.LIGHT]: {
    background: Colors.NEUTRAL_0,
    border: Colors.OTHER_2,
    line: Colors.NEUTRAL_20,
  },
  [THEME_MODE.DARK]: {
    background: Colors.NEUTRAL_100,
    border: Colors.OTHER_3,
    line: Colors.NEUTRAL_90,
  },
};

const CommentPopup = ({ children }) => {
  const themeMode = useThemeMode();
  return (
    <ThemeProvider
      theme={{
        commentPopup: THEMES[themeMode],
      }}
    >
      <div className={`theme-${themeMode}`}>{children}</div>
    </ThemeProvider>
  );
};
CommentPopup.propTypes = {
  children: PropTypes.node.isRequired,
};

export const commentPopupThemeGetter = (props) => props.theme.commentPopup;

export default CommentPopup;
