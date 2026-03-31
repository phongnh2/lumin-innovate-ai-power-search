import { makeStyles } from '@mui/styles';
import styled from 'styled-components';

import BaseScrollContainer from '@new-ui/general-components/BaseScrollContainer';

import { typographies, spacings } from 'constants/styles/editor';

const HEADER_H = 72;
const FOOTER_H = 58;

export const useFormControlStyled = makeStyles({
  label: ({ theme }) => ({
    ...typographies.le_body_medium,
    color: theme.le_main_on_surface,
  }),
});

export const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
  padding: 0 ${spacings.le_gap_2}px;
  height: ${HEADER_H}px;
`;

export const Title = styled.span`
  ${{ ...typographies.le_title_medium }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;

export const TabsWrapper = styled.div`
  border-radius: 99999px;
  border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
`;

export const FooterWrapper = styled.div`
  height: ${FOOTER_H}px;
  display: flex;
  gap: ${spacings.le_gap_2}px;
  padding-left: ${spacings.le_gap_2}px;
  padding-right: ${spacings.le_gap_2}px;
  padding-top: ${spacings.le_gap_0_25}px;

  .children-btn {
    flex-basis: 50%;
    width: 50%;
  }
`;

export const MainContentWrapper = styled(BaseScrollContainer)`
  height: calc(100% - ${HEADER_H}px - ${FOOTER_H}px);
`;

export const FormBuilder = styled.div`
  padding-top: var(--kiwi-spacing-1-5);
  height: calc(100% - 52px);
`;

const BaseLabel = styled.div`
  ${{ ...typographies.le_title_medium }}
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const PropertiesLabel = styled(BaseLabel)`
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;

export const FieldLabel = styled(BaseLabel)`
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const MainContentInnerWrapper = styled.div`
  padding: ${spacings.le_gap_1}px;
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
`;

export const PropertiesContent = styled.div`
  color: ${({ theme }) => theme.le_main_on_surface};
  ${{ ...typographies.le_label_medium }}
  display: flex;
  gap: ${spacings.le_gap_0_5}px;
  align-items: center;
`;

export const NoProperties = styled.div`
  color: ${({ theme }) => theme.le_main_on_surface_variant};
  ${{ ...typographies.le_body_small }}
`;

export const BaseSection = styled.div`
  padding: ${spacings.le_gap_0_5}px ${spacings.le_gap_1}px;
`;

export const CheckboxesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${spacings.le_gap_0_5}px;
`;

export const TextStyleRow = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;
`;

export const FontSelectWrapper = styled.div`
  flex-basis: 75%;
`;

export const FontSizeSelectWrapper = styled.div`
  flex-basis: 25%;
  .MuiInputBase-root {
    padding-right: 24px !important;
  }
`;

export const TextStyleTitle = styled.div`
  ${{ ...typographies.le_title_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const TextStyleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
  margin-bottom: ${spacings.le_gap_2}px;
`;

export const DimensionContainer = styled.div`
  padding: ${spacings.le_gap_1}px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.le_main_surface_container_low};
  display: flex;
  gap: ${spacings.le_gap_1}px;
  > * {
    flex-basis: 50%;
  }
`;

export const Desc = styled.div`
  padding: 0px ${spacings.le_gap_1}px;
  ${{ ...typographies.le_body_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const CreateNewGroupBtnContent = styled.span`
  color: ${({ theme }) => theme.le_main_on_surface};
  ${{ ...typographies.le_title_small }}
`;

export const ScrollWrapper = styled(BaseScrollContainer)`
  max-height: 192px;
`;

export const RadioBtnDesc = styled.div`
  color: ${({ theme }) => theme.le_main_on_surface_variant};
  ${{ ...typographies.le_body_small }}
  margin-top: ${spacings.le_gap_1}px;
`;
