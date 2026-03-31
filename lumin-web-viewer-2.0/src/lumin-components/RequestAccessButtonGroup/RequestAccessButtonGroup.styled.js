import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors } from 'constants/styles';
import { mediaQueryDown } from 'utils/styles/mediaQuery';

export const ButtonRequest = styled(ButtonMaterial)`
  margin-left: 8px;
  font-size: 14px;
  line-height: 20px;
  padding-left: 8px;
  padding-right: 8px;
  color: ${({ theme, $reject }) => $reject && theme.rejectButtonColor};
  ${mediaQueryDown.md`
    font-size: 12px;
    line-height: 16px;
    padding-left: 6px;
    padding-right: 6px;
    min-width: 0;
  `}
  &:hover {
    background-color: ${({ theme }) =>
      theme.requestAccessButtonBgHover || Colors.NEUTRAL_20};
    color: ${({ theme, $reject }) => $reject && theme.rejectButtonColor};
  }
`;

export const Container = styled.div`
  display: flex;
  & > * {
    margin-left: 4px;
  }
`;
