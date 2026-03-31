import { makeStyles } from '@mui/styles';
import { typographies, spacings } from 'constants/styles/editor';
import styled from 'styled-components';

export const InsertAllPagesWrapper = styled.div`
  padding: 0px ${spacings.le_gap_1}px;
`;

export const CheckboxWrapper = styled.div`
  padding: 0px 11px;
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const Title = styled.span`
  ${{ ...typographies.le_title_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;
export const BaseTitleWrapper = styled.div`
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const ChoosePosotionTitleWrapper = styled(BaseTitleWrapper)`
  padding: 0 ${spacings.le_gap_1}px;
`;

export const ChoosePositionDesc = styled.span`
  ${{ ...typographies.le_body_small }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;
export const ChoosePositionDescWrapper = styled.div`
  margin-bottom: ${spacings.le_gap_1}px;
  padding: 0px ${spacings.le_gap_1}px;
`;

export const SelectPositionWrapper = styled.div`
  padding: 0 ${spacings.le_gap_1}px;
  width: 100%;
  margin-bottom: var(--kiwi-spacing-2);
`;

export const BaseContentWrapper = styled.div`
  padding: ${spacings.le_gap_1}px;
  margin-bottom: ${spacings.le_gap_1}px;
  width: 100%;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.le_main_surface_container_low};
`;

export const SelectPositionContent = styled(BaseContentWrapper)`
  margin-top: ${spacings.le_gap_1}px;
`;
export const InsertAllWrapper = styled(BaseContentWrapper)``;

export const Label = styled.div`
  ${{ ...typographies.le_label_medium }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
  margin-bottom: ${spacings.le_gap_0_25}px;
`;

export const PageLabel = styled(Label)`
  margin-top: 8px;
`;
export const TotalPage = styled.span`
  ${{ ...typographies.le_label_medium }}
  color: ${({ theme }) => theme.le_main_on_surface};
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: 10px;
`;
export const LocationWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_2}px;

  & .MuiInputBase-root {
    flex-grow: 1;
  }
`;
export const MergeBtnsWrapper = styled.div`
  padding: 0px ${spacings.le_gap_1}px ${spacings.le_gap_1}px;
  > :first-child {
    margin-right: ${spacings.le_gap_2}px;
  }
`;
export const ModalDesc = styled.span`
  ${{ ...typographies.le_body_medium }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;

export const Error = styled.div`
  color: ${({ theme }) => theme.le_error_error};
  ${{ ...typographies.le_body_small }}
  margin-bottom: ${spacings.le_gap_1}px;
`;
