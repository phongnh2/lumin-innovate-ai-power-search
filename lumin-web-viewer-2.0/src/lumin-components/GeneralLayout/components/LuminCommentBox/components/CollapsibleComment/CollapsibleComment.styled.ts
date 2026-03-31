import { typographies } from 'constants/styles/editor';
import { CommentContentStyles } from 'features/Comments/comment.styled';
import styled, { css } from 'styled-components';

// 21px is the height of a single line of text
export const COMMENT_CONTENT_MAX_HEIGHT = 21 * 3;

export const ActionButton = styled.div`
  ${typographies.le_label_medium};
  cursor: pointer;
  margin-top: 4px;
  ${({ theme }) => css`
    color: ${theme.le_main_primary};
  `}
`;

export const Wrapper = styled.div`
  ${CommentContentStyles};
`;

export const ContentOuter = styled.div`
  &[data-collapsed='true'] {
    max-height: ${COMMENT_CONTENT_MAX_HEIGHT}px;
    overflow: hidden;
  }
`;

export const ContentInner = styled.div`
  overflow: auto;
`;

export const Content = styled.div<{
  $isVisible: boolean;
}>`
  ${({ $isVisible }) => css`
    display: ${$isVisible ? 'block' : 'none'};
  `}
`;
