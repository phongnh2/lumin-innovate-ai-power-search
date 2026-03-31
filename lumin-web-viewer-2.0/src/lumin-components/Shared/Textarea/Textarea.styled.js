import styled from 'styled-components';

import { Colors } from 'constants/styles';
import themeConstants from 'constants/theme';
import { mediaQuery } from 'utils/styles/mediaQuery';

const getTextareaColor = (props) => {
  const colors = themeConstants.Textarea.textareaColorGetter(props);

  return {
    border: `1px solid ${colors.borderColor}`,
    color: colors.textColor,
    background: colors.backgroundTextarea,
    '&:focus': colors.focus,
    disabled: colors.disabled,
  };
};

export const Label = styled.div`
  display: block;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-bottom: 4px;
`;

export const Textarea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  height: 96px;
  border-radius: var(--border-radius-primary);
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  font-family: var(--font-primary);
  padding: 14px 16px;
  outline: none;
  resize: none;
  ${getTextareaColor};

  ${({ $hasError }) => $hasError && `
    border-color: ${Colors.SECONDARY_50};
  `}

  ${(props) => props.disabled && `
    ${getTextareaColor(props).disabled}
    cursor: not-allowed;
  `}

  &::placeholder {
    font-family: var(--font-primary);
    color: ${Colors.NEUTRAL_40};
    -webkit-text-fill-color: ${Colors.NEUTRAL_40}; /* required on iOS, safari */
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
  }

  ${mediaQuery.md`
    height: 120px;
  `}
`;

export const ErrorMessage = styled.p`
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.SECONDARY_50};
  font-weight: 400;
  margin-top: 4px;
`;

export const Container = styled.div`
  &:focus-within {
    ${ErrorMessage} {
      display: none;
    }
  }
`;
