import styled, { css } from 'styled-components';
import ReactQuill from 'react-quill';

import { Colors } from 'constants/styles';
import { CommentScrollbar } from 'constants/styles/editor/scrollbar';
import { THEME_MODE } from 'constants/lumin-common';

import ActionButton from 'lumin-components/ActionButton';

const lightTheme = {
  BACKGROUND_COLOR: Colors.NEUTRAL_100,
  ACTIVE_COLOR: Colors.PRIMARY_90,
  DISABLED_COLOR: Colors.NEUTRAL_60,
  DIVIDER: Colors.NEUTRAL_20,
  TOOLTIP_COLOR: Colors.NEUTRAL_40,
  TOOLTIP_HOVER: Colors.NEUTRAL_60,
  COMMENT_COLOR: Colors.NEUTRAL_100,
  PLACEHOLDER: Colors.NEUTRAL_40,
};

const darkTheme = {
  BACKGROUND_COLOR: Colors.NEUTRAL_100,
  ACTIVE_COLOR: Colors.PRIMARY_90,
  DISABLE_COLOR: Colors.NEUTRAL_40,
  DIVIDER: Colors.NEUTRAL_90,
  TOOLTIP_COLOR: Colors.NEUTRAL_60,
  TOOLTIP_HOVER: Colors.NEUTRAL_40,
  COMMENT_COLOR: Colors.NEUTRAL_10,
  PLACEHOLDER: Colors.NEUTRAL_60,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

const fadeIn = `
  from {
    transform: translateY(0);
  }
  to {
    opacity: 1;
    transform: translateY(32px);
  }
`;

export const fadeAnimations = {
  fadeIn: css`
    animation: 0.5s linear 0s forwards ${fadeIn};
  `,
};

const StyleInfo = styled.span`
  height: fit-content;
`;

export const Underline = styled(StyleInfo)`
  text-decoration: underline;
`;

export const Italic = styled(StyleInfo)`
  font-style: italic;
`;

export const Bold = styled(StyleInfo)`
  font-weight: 800;
`;

export const Wrapper = styled.div`
  width: 100%;
  bottom: 0;
  min-height: 32px;
  height: fit-content;
  display: flex !important;
  flex-direction: column;
  border-radius: 8px;

  ${({ isFocusedInput }) =>
    isFocusedInput
      ? `
      border: 1px solid  ${Colors.PRIMARY_50};
      box-shadow: 0 0 0 1.2px ${Colors.PRIMARY_30};
    `
      : `
      border: 1px solid  ${Colors.NEUTRAL_30};
  `};

  .ql-editor {
    color: ${({ theme }) => theme.COMMENT_COLOR};
    &.ql-blank {
      color: ${({ theme }) => theme.PLACEHOLDER};
    }
  }
`;

export const StyleWrapper = styled.div`
  width: 100%;
  bottom: 0;
  border-radius: 0 0 8px 8px !important;
  justify-content: space-between;
  align-items: center;
  ${({ $isFocusedInput, $shouldShowToolBar }) =>
    $isFocusedInput && $shouldShowToolBar
      ? `
      ${fadeAnimations.fadeIn};
        height: 32px;
        display: flex !important;
        padding: 1px 6px;
      ` : `
        display: none;
        height: 0px;
        padding: 0px;
    `}
`;

export const ToolTipContent = styled.span`
  padding: 8px;
  line-height: 14px;
  font-size: 12px;
  font-weight: 500;
`;

export const Container = styled.div`
  width: 296px;
  height: 32px;
  display: flex;
`;

export const ToolTipContainer = styled.div`
  font-weight: 500;
`;

export const StyleItem = styled(ActionButton)`
  margin-left: 6px;
  border: none;
`;

export const InputArea = styled(ReactQuill)`
  padding: 8px 4px 8px 12px;

  ${CommentScrollbar}

  ${({ theme, isFocusedInput, showToolBar, limitHeight }) => `
    border-bottom: ${isFocusedInput && showToolBar ? `1px solid ${theme.DIVIDER}` : `0`};
    color: ${theme.COMMENT_COLOR};
    .ql-editor.ql-blank::before {
      color: ${theme.PLACEHOLDER};
    }
    // 110px is the max-height of input of comment if the comment is popup, so if i use richtext, I have to  minus 32 is 78
    .ql-editor {
      width: 100%;
      em {
        font-style: italic;
      }
    }
  `};
`;
