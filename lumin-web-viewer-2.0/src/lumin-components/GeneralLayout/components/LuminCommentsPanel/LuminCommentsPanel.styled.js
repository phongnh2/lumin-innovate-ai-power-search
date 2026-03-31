import styled, { css } from 'styled-components';

import { BasePanel, BasePanelContent } from 'lumin-components/GeneralLayout/GeneralLayout.styled';

import { LUMIN_COMMENT_SPACING } from 'constants/lumin-common';

export const LuminCommentsPanel = styled(BasePanel)`
  background-color: transparent;
  position: fixed;
  width: calc(var(--lumin-comment-panel-width) + ${LUMIN_COMMENT_SPACING * 2}px);
  will-change: width, opacity, left, top;
  transition-property: width, opacity, left, top, transform;
  transition-duration: 250ms;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  height: calc(100% - var(--header-height) - var(--toolbar-height));
  opacity: 0;
  visibility: hidden;

  ${(props) =>
    props.$show &&
    css`
      opacity: 1;
      position: absolute;
      visibility: visible;
    `}
`;

export const LuminCommentsPanelContent = styled(BasePanelContent)`
  --header-height: 56px;
  --toolbar-height: 48px;
  width: 100%;
  background-color: transparent;
  padding: 16px ${LUMIN_COMMENT_SPACING}px 40px;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

export const CommentList = styled.div`
  position: relative;
  width: 100%;
  top: 0;
`;
