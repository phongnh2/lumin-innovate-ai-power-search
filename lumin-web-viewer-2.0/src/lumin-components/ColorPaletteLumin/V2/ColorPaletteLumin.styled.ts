import styled from 'styled-components';

export const Container = styled.div`
  &[data-new-layout='true'] {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`

export const ColorPaletteContainer = styled.div`
  &[data-new-layout='true'] {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    width: 100%;

    .color-cell {
      width: 24px;
      min-width: 24px;
      height: 24px;
      border-radius: 99px;
      cursor: pointer;
      border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
      &.active {
        outline: 1px solid ${({ theme }) => theme.le_main_on_surface};
        outline-offset: 2px;
      }
    }
  }
`;
