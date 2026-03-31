import { spacings } from 'constants/styles/editor';
import styled from 'styled-components';
import Menu from '@new-ui/general-components/Menu';

export const AnnotationPopupContent = styled.div`
  background: ${({ theme }) => theme.kiwi_colors_surface_surface_bright};
`;

export const ContentWrapper = styled.div`
  padding: ${spacings.le_gap_1}px;
  gap: ${spacings.le_gap_1}px;
  display: flex;
  align-items: center;
`;

export const MoreOptionMenu = styled(Menu)`
  background: ${({ theme }) => theme.kiwi_colors_surface_surface_bright};
`;

export const ColorPaletteWrapper = styled.div`
  background: ${({ theme }) => theme.kiwi_colors_surface_surface_bright};
  padding: ${spacings.le_gap_1}px;
`;
