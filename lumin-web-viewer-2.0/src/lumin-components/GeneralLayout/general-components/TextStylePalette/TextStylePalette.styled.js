import { spacings, typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const Row = styled.div`
  margin: -${spacings.le_gap_0_5}px;
  margin-right: -${spacings.le_gap_0_5}px;
  display: flex;
  flex-flow: row wrap;
  min-width: 0;
  .color-palette {
    padding-left: ${spacings.le_gap_0_5}px;
  }
`;

const BaseCol = styled.div`
  padding-left: ${spacings.le_gap_0_5}px;
  padding-right: ${spacings.le_gap_0_5}px;
  display: block;
`;

export const LeftCol = styled(BaseCol)`
  flex: 0 0 60%;
  max-width: 60%;
`;

export const RightCol = styled(BaseCol)`
  flex: 0 0 40%;
  max-width: 40%;
`;

export const Title = styled.div`
  ${{ ...typographies.le_title_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
  width: 272px;
  .color-palette {
    padding-left: ${spacings.le_gap_0_5}px;
  }
`;

export const SecondRowWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;

  .MuiAutocomplete-root {
    flex-grow: 1;
  }
`;
