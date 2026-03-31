import styled from 'styled-components';
import { typographies } from 'constants/styles/editor';


export const ListSeparatorWrapper = styled.div`
  height: 24px;
  display: table-cell;
  user-select: none;
  text-align: left;
  vertical-align: bottom;
  ${({...typographies.le_title_small})};
  ${({ theme }) =>
  `
    color: ${theme.le_main_on_surface_variant};
  `}
`;
