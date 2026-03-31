import styled from 'styled-components';
import { typographies, spacings } from "constants/styles/editor";

export const PlanWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  max-width: 268px;
  margin: ${spacings.le_gap_4}px auto;
`

export const PlanImage = styled.img`
  width: 180px;
  margin-bottom: ${spacings.le_gap_2}px;
`

export const PlanTitle = styled.span`
  ${{...typographies.le_label_large}};
  font-weight: 580;
  margin-bottom: ${spacings.le_gap_1}px;
  ${({ theme}) => `
    color: ${theme.le_main_on_surface};
  `};
`

export const PlanDesc = styled.span`
  ${{...typographies.le_body_small}};
  text-align: center;
  margin-bottom: ${spacings.le_gap_2}px;
  
  & b {
    font-weight: bold;
  }
  ${({ theme}) => `
    color: ${theme.le_main_on_surface_variant};
  `};
`

export const LearnMore = styled.a`
  ${{...typographies.le_body_small}};
  text-decoration: underline;
  cursor: pointer;
  padding-left: 4px;

  ${({ theme}) => `
    color: ${theme.le_main_primary};
  `};
`