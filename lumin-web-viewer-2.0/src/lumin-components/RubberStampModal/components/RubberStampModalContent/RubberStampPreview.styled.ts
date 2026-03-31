import { spacings, typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const Container = styled.div`
  &[data-new-layout='true'] {
    background: ${({ theme }) => theme.le_main_surface_container_lowest};
    border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
    border-radius: var(--border-radius-primary);
    overflow: hidden;
    margin-bottom: ${spacings.le_gap_2}px;
  }
`;

export const Header = styled.div`
  &[data-new-layout='true'] {
    background: ${({ theme }) => theme.le_main_surface_container_low};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 8px;
  }
`;

export const HeaderTitle = styled.h3`
  &[data-new-layout='true'] {
    ${typographies.le_title_small};
  }
`;

export const HeaderDateTime = styled.div`
  display: flex;
`;

export const PreviewBody = styled.div`
  &[data-new-layout='true'] {
    padding: 12px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const Canvas = styled.canvas`
  display: block;
`;
