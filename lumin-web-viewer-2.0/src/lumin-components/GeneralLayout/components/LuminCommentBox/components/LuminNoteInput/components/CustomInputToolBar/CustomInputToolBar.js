/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Tooltip from 'lumin-components/Shared/Tooltip';

import { useTranslation } from 'hooks';

import { textStyleList, TextStyle } from 'constants/textStyle';

import * as Styled from './CustomInputToolBar.styled';
// Quill Toolbar component

CustomInputToolBar.propTypes = {
  toolbarId: PropTypes.string.isRequired,
  disableToolBar: PropTypes.bool,
};

CustomInputToolBar.defaultProps = {
  disableToolBar: false,
};

export default function CustomInputToolBar({ toolbarId, disableToolBar }) {
  const { t } = useTranslation();

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
    <Styled.Wrapper id={toolbarId} disableToolBar={disableToolBar}>
      <span className="ql-formats">{renderCustomToolBar()}</span>
    </Styled.Wrapper>
  );
}
