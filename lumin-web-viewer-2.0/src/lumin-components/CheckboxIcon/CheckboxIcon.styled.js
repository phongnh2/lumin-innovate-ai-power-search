import styled from 'styled-components';

import themeConstants from 'constants/theme';

const getSize = (props) => props.$size;

const generateCheckboxColor = (props) => {
  const colorSuit = themeConstants.Checkbox.checkboxColorGetter(props);
  if (props.$disabled && props.$checked) {
    return {
      ...colorSuit.checkedDisabled,
      background: props.$checkedColor || colorSuit.checkedDisabled.background,
    };
  }
  if (props.$disabled) {
    return {
      ...colorSuit.uncheckDisabled,
      background: props.$checkedColor || colorSuit.uncheckDisabled.background,
    };
  }
  if (props.$checked) {
    return {
      ...colorSuit.checked,
      background: props.$checkedColor || colorSuit.checked.background,
    };
  }
  const customBorder = props.$border || props.theme.CHECKBOX_BORDER;
  return {
    ...colorSuit.uncheck,
    border: customBorder ? themeConstants.Checkbox.getBorder(customBorder) : colorSuit.uncheck.border,
    background: props.theme.CHECKBOX_BG || props.$background || colorSuit.uncheck.background,
  };
};

export const Container = styled.div`
  box-sizing: border-box;
  width: ${getSize}px;
  height: ${getSize}px;
  border-radius: var(--border-radius-dense);
  display: flex;
  align-items: center;
  justify-content: center;
  ${generateCheckboxColor};
`;

export const ContainerReskin = styled.div`
  box-sizing: border-box;
  width: ${getSize}px;
  height: ${getSize}px;
  border-radius: var(--border-radius-dense);
  display: flex;
  align-items: center;
  justify-content: center;
  ${generateCheckboxColor};

  &:hover {
    border: 1px solid ${(props) => props.$checkedColor};
  }
`;
