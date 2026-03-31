import { Colors, Fonts } from 'constants/styles';
import styled from 'styled-components';

export const Header = styled.div`
  display: grid;
  column-gap: 20px;
  grid-template-columns: minmax(0, 1fr) min-content;
  align-items: center;
  margin-bottom: 4px;
`;

export const Label = styled.p`
  margin-bottom: 0;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_80};
  display: block;
  line-height: 16px;
`;

export const LabelReskin = styled.p`
  margin-bottom: 0;
  font-size: 12px;
  font-weight: 500;
  font-family: ${Fonts.SECONDARY};
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  display: block;
  line-height: 100%;
`;

export const ElementContainer = styled.label`
  position: relative;
  display: block;
`;

export const ClearButton = styled.div`
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translate3d(0, -50%, 0);
  z-index: 1;
`;

export const Error = styled.small`
  font-family: ${Fonts.PRIMARY};
  font-size: 12px;
  letter-spacing: 0.3px;
  color: ${Colors.ACCENT};
  margin-top: 8px;
  display: block;
  font-weight: 400;
`;

export const Element = styled.div`
  box-sizing: border-box;
  width: 100%;
  background-color: #fff;
  border: var(--border-primary);
  border-radius: var(--border-radius-primary);
  height: 48px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  cursor: text;
  transition: all 0.3s ease;

  ${({ $hasError }) => $hasError && `
    border-color: ${Colors.SECONDARY_50};
  `}

  ${({ $isFocusing }) => $isFocusing && `
    border-color: ${Colors.PRIMARY_50};
    box-shadow: 0 0 0 1.2px ${Colors.PRIMARY_30};
  `}

  ${({ disabled, $readOnly }) => ($readOnly || disabled) && `
    background-color: ${Colors.NEUTRAL_10};
    border: var(--border-secondary);
    pointer-events: none;
    color: ${Colors.NEUTRAL_40};
  `}

  > div {
    flex: 1;
  }
`;
