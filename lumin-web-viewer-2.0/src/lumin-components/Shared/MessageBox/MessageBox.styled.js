import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledContainer = styled.div`
  padding: ${(props) => (props.expanded ? '8px 12px 8px 16px' : '10px 16px')};
  border-radius: var(--border-radius-primary);
  background-color: ${Colors.PRIMARY_10};
  align-items: center;

  ${mediaQuery.md`
    padding: 16px;
  `}
  ${(props) => props.isShowIcon && `
    display: grid; 
    grid-template-columns: max-content auto;
    column-gap: 12px;
  `}
  span {
    font-size: ${(props) => (props.textSize ? `${props.textSize}px` : '14px')};
    font-weight: 600;
    line-height: 1.43;
    letter-spacing: 0.34px;
    color: ${Colors.NEUTRAL_90};
  }
  a {
    color: ${Colors.SECONDARY_50};
    text-decoration: underline;
  }
`;
