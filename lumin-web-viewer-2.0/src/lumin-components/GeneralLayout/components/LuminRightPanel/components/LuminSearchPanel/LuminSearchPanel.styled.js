import styled from 'styled-components';
import { typographies, spacings } from 'constants/styles/editor';
import Divider from 'lumin-components/GeneralLayout/general-components/Divider';


export const SearchPanelHeader = styled.div`
  height: 48px;
  display: flex;
  padding: ${spacings.le_gap_1}px ${spacings.le_gap_1_5}px;
`;

export const Title = styled.p`
  width: 100%;
  ${({...typographies.le_title_small})};
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;

export const ResultInfo = styled.div`
  margin-top: 24px !important;
  text-align: center;
  ${({...typographies.le_body_small})};
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;

export const ResultWrapper = styled.div`
  padding: ${spacings.le_gap_0_5}px ${spacings.le_gap_1_5}px ${spacings.le_gap_1_5}px ${spacings.le_gap_1_5}px;
`;

export const CustomDivider = styled(Divider)`
  margin: 0 ${spacings.le_gap_0_25}px;
`;