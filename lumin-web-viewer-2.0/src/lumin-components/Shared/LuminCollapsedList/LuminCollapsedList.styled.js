import styled from 'styled-components';
import { ButtonBase } from '@mui/material';
import { Colors, Fonts } from 'constants/styles';
import { styledPropConfigs } from 'utils/styled';

export const Container = styled.div`

`;

export const HeaderContainer = styled(ButtonBase).withConfig(styledPropConfigs(['collapsible']))`
  font-family: ${Fonts.PRIMARY};
  width: 100%;
  height: 24px;
  display: grid;
  grid-template-columns: 1fr max-content;
  column-gap: 16px;
  align-items: center;
  padding: 0 24px;
  cursor: ${({ collapsible }) => (collapsible ? 'pointer' : 'default')};
  justify-content: start;
`;

export const HeaderText = styled.h5`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_60};
  text-align: left;
  text-transform: uppercase;
`;

export const HeaderArrow = styled.div.withConfig(styledPropConfigs(['isOpen']))`
  width: 20px;
  height: 20px;
  transform: rotate3d(0, 0, 1, ${({ isOpen }) => (isOpen ? '-180deg' : '0deg')});
  transition: transform 0.3s ease-in;
  display: flex;
  align-items: center;
  justify-content: center;
  i {
    margin-right: 0
  }
`;

export const List = styled.ul`
  margin-top: 4px;
`;

export const Item = styled.li`

`;
