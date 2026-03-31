import { typographies as kiwiTypographies } from 'lumin-ui/tokens';
import { KeyboardEventHandler } from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import styled, { css } from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';
import MaterialPopper from 'lumin-components/MaterialPopper';

import { isFirefox } from 'helpers/device';

import { CommentContentStyles } from 'features/Comments/comment.styled';

import { ZIndex } from 'constants/styles';
import { typographies, spacings } from 'constants/styles/editor';
import { CommentScrollbar } from 'constants/styles/editor/scrollbar';

type ContainerProps = {
  isUpdateContent: boolean;
};

type WrapperProps = {
  $isFocusedInput: boolean;
};

type StyledWrapper = WrapperProps & {
  shouldShowToolBar: boolean;
};

type InputAreaProps = WrapperProps & {
  showToolBar: boolean;
  limitHeight: boolean;
  ref: (node: ReactQuill) => void;
  onFocus?: () => void;
  formats: object;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onBlur?: () => void;
  placeholder: string;
  defaultValue?: string;
  onChange?: ReactQuillProps['onChange'];
  modules?: object;
  readOnly?: boolean;
};

export const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  position: relative;
  border: none;

  ${({ isUpdateContent }) => `
    padding: ${
      isUpdateContent
        ? `
        ${spacings.le_gap_2}px 0;
      `
        : `
        ${spacings.le_gap_2}px;
      `
    }
  `};

  .MaterialAvatar {
    padding-right: 10px;
  }
`;

export const PopperContainer = styled.div`
  width: 100%;
`;

export const RichTextContainer = styled.div`
  width: 296px;
  height: 32px;
  display: flex;
`;

export const Wrapper = styled.div<WrapperProps>`
  width: 100%;
  bottom: 0;
  min-height: 32px;
  height: fit-content;
  display: flex !important;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid;
  ${CommentContentStyles};

  ${({ $isFocusedInput, theme }) =>
    $isFocusedInput
      ? css`
          outline: 4px solid ${theme.le_main_secondary_container};
          border-color: ${theme.le_main_secondary};
        `
      : css`
          border-color: ${theme.le_main_outline_variant};
        `}
`;

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

export const StylesWrapper = styled.div<StyledWrapper>`
  width: 100%;
  bottom: 0;
  border-radius: 0 0 8px 8px !important;
  justify-content: space-between;
  align-items: center;
  ${({ $isFocusedInput, shouldShowToolBar }) =>
    $isFocusedInput && shouldShowToolBar
      ? `
        height: 32px;
        display: flex !important;
        padding: 1px 6px;
      `
      : `
        display: none;
        height: 0px;
        padding: 0px;
    `}
`;

export const ToolTipContainer = styled.div`
  ${{ ...typographies.le_body_small }};
  ${({ theme }) => `
    color: ${theme.le_main_inverse_on_surface}
  `}
`;

export const InputArea = styled(ReactQuill)<InputAreaProps>`
  ${{ ...typographies.le_body_medium }};

  ${CommentScrollbar}

  ${({ theme, $isFocusedInput, showToolBar }) => css`
    border-bottom: ${$isFocusedInput && showToolBar ? `1px solid ${theme.le_main_outline_variant}` : `0`};
    color: ${theme.le_main_on_surface};
    .ql-editor.ql-blank::before {
      color: ${theme.le_disable_on_container};
    }
    /* 110px is the max-height of input of comment if the comment is popup, so if i use richtext, I have to  minus 32 is 78 */
    .ql-editor {
      padding: ${spacings.le_gap_1}px !important;
      width: 100%;
      em {
        font-style: italic;
      }
    }
  `};

  ${isFirefox &&
  css`
    .ql-container .ql-editor {
      white-space: pre-wrap;
    }
  `}
`;

export const ToolTipIcon = styled(Icomoon)`
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `};
`;

export const PopperMentionContainer = styled(MaterialPopper)`
  z-index: ${ZIndex.POPOVER};
  width: var(--lumin-mention-popper-width);
  padding: var(--kiwi-spacing-1);
  border-radius: var(--kiwi-border-radius-md);
  background-color: var(--kiwi-colors-surface-surface-bright);
  box-shadow: var(--kiwi-shadow-2);

  .Popper__styleContent {
    background-color: transparent;
    border: none;
    box-shadow: none;
    margin: 0;
    border-radius: 0;
  }
  .Popper__contentScroll {
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }
`;

export const InfoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  gap: var(--kiwi-spacing-1);
`;

export const UserName = styled.p`
  ${kiwiTypographies.kiwi_typography_label_sm};
  font-weight: bold;
`;

export const UserEmail = styled.p`
  ${kiwiTypographies.kiwi_typography_body_sm};
  color: var(--kiwi-colors-surface-on-surface-variant);
`;
