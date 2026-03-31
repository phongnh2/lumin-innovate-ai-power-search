import styled from 'styled-components';
import { ZIndex } from 'constants/styles';

export const CommentPopupWrapper = styled.div`
  position: fixed;
  display: block;
  z-index: ${ZIndex.LUMIN_RIGHT_PANEL};
  width: var(--lumin-comment-popper-width);
  border-radius: 16px;
  opacity: 0;
`;