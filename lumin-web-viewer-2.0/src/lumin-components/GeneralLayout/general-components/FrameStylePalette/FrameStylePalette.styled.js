import styled from 'styled-components';
import { typographies, spacings } from 'constants/styles/editor';

export const Title = styled.div`
  ${{ ...typographies.le_title_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const Wrapper = styled.div``;
export const TabsWrapper = styled.div`
  height: 32px;
  margin-bottom: ${spacings.le_gap_1}px;
  background-color: ${({ theme }) => theme.le_main_surface_container_lowest};
  border-radius: 9999999px;
`;
export const Content = styled.div``;

export const ContentInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
  align-items: flex-start;

  > .color-palette {
    align-self: normal;
    padding-left: ${spacings.le_gap_0_5}px;
  }
`;

export const SliderWrapper = styled.div`
  height: 32px;
  width: 100%;
  display: flex;
  gap: ${spacings.le_gap_1}px;
  align-items: center;

  .text-field-wrapper {
    max-width: 60px;
    input {
      padding-left: 0;
    }
  }
`;

export const ColorPaletteWrapper = styled.div`
  width: 100%;
`;
