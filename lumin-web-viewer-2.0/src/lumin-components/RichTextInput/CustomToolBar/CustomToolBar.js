/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import Tooltip from 'lumin-components/Shared/Tooltip';

import { useTranslation, useThemeMode } from 'hooks';

import { textStyleList, TextStyle } from 'constants/textStyle';

import * as Styled from './CustomToolBar.styled';
// Quill Toolbar component

CustomToolbar.propTypes = {
  toolbarId: PropTypes.string.isRequired,
  disableToolBar: PropTypes.bool,
};

CustomToolbar.defaultProps = {
  disableToolBar: false,
};

export default function CustomToolbar({ toolbarId, disableToolBar }) {
  const { t } = useTranslation();
  const themeMode = useThemeMode();

  if (!toolbarId) {
    return null;
  }

  const renderCustomToolBar = () => (
    <>
      {textStyleList(t).map((item) => (
        <Tooltip key={item.styleName} title={item.toolTipContent}>
          <Styled.StyleItem
            disableToolBar={disableToolBar}
            className={classNames({
              'ql-bold ': item.styleName === TextStyle.BOLD,
              'ql-italic': item.styleName === TextStyle.ITALIC,
              'ql-underline': item.styleName === TextStyle.UNDERLINE,
            })}
            onClick={item.onClick}
          />
        </Tooltip>
      ))}
    </>
  );

  return (
    <ThemeProvider theme={Styled.theme[themeMode]}>
      <Styled.Wrapper id={toolbarId} disableToolBar={disableToolBar}>
        <span className="ql-formats">{renderCustomToolBar()}</span>
      </Styled.Wrapper>
    </ThemeProvider>
  );
}
