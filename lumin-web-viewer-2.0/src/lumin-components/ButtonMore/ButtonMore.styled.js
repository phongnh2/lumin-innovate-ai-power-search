import styled from 'styled-components';
import PopperButton from 'luminComponents/PopperButton';
import { Colors } from 'constants/styles';

export const Button = styled.div`
  display: flex;
  justify-content: center;
`;

export const CustomPopperButton = styled(PopperButton)`
  --background-hover: ${({ $hoverColor }) => $hoverColor || 'rgba(255, 255, 255, 0.3)'};
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
  border-radius: var(--border-radius-primary);
  &:hover {
    background: var(--background-hover);
  }
  &.active {
    background: var(--background-hover);
  }
  .icon {
    &:before {
      color: ${Colors.NEUTRAL_60};
    }
  }
`;
