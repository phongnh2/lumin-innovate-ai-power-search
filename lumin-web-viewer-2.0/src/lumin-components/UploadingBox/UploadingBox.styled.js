import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { ZIndex } from 'constants/styles';

export const Container = styled.div`
  position: fixed;
  bottom: 24px;
  right: 16px;
  ${mediaQuery.md`
    bottom: 24px;
    right: 24px;
  `}
  z-index: ${ZIndex.UPLOAD_MODAL};
`;

export const Wrapper = styled.div`
  width: 438px;
  border-radius: var(--border-radius-primary);
  box-shadow: var(--shadow-m);
  border: var(--border-secondary);
  background-color: #fff;
  box-sizing: border-box;
  overflow: hidden;
`;
