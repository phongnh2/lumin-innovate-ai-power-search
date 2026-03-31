import styled from 'styled-components';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 24px;
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  background-color: ${Colors.NEUTRAL_100};
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  border-radius: var(--border-radius-primary);
  transition: transform 0.3s ease, opacity 0.3s ease;
  ${(props) => `transform: translate3d(0, ${props.$open ? '-24px' : '32px'}, 0);`}
  ${(props) => `opacity: ${(props.$open ? 1 : 0)};`}
`;
