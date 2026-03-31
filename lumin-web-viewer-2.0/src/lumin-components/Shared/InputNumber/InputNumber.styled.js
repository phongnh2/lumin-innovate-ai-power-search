import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import ButtonIcon from '../ButtonIcon';

export const StyledContainer = styled.div`
  width: 100%;
  display: inline-flex;
  background: none;
  border-radius: var(--border-radius-primary);
  box-sizing: border-box;
  overflow: hidden;
  .button--borderred {
    border-radius: 0;
  }
`;

export const StyledInput = styled.input`
  width: calc(100% - 96px);
  height: 48px;
  padding: 0 12px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 600;
  line-height: 40px;
  text-align: center;
  border: none;
  border-top: var(--border-primary);
  border-bottom: var(--border-primary);
  outline: none;
  box-shadow: none;
  min-width: 0;
  color: ${Colors.NEUTRAL_60};
  font-family: ${Fonts.PRIMARY};
`;
export const StyledButton = styled(ButtonIcon)`
  width: 48px;
  height: 48px;
  background-color: ${Colors.NEUTRAL_100};

  ${(props) => (props.disabled ? `
    &&& {
      background-color: ${Colors.NEUTRAL_30};
      opacity: 1;
      cursor: not-allowed;
      pointer-events: auto;
    }
  ` : `
    &:hover {
      background-color: ${Colors.NEUTRAL_80};
    }
  `)}
`;
