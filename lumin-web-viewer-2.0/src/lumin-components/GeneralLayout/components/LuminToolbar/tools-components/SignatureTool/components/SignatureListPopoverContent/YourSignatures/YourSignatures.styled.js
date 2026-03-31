import { ScrollArea } from 'lumin-ui/kiwi-ui';
import styled from 'styled-components';

import IconButton from '@new-ui/general-components/IconButton';

import { typographies, spacings } from 'constants/styles/editor';

export const Desc = styled.div`
  ${{ ...typographies.le_body_small }};
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const Title = styled.div`
  ${{ ...typographies.le_title_small }};
  color: ${({ theme }) => theme.le_main_on_surface};
  margin-bottom: ${spacings.le_gap_0_5}px;
`;

export const NavigateBtn = styled.span`
  color: ${({ theme }) => theme.le_main_primary};
  text-decoration-line: underline;
`;

export const Wrapper = styled.div`
  margin-bottom: ${spacings.le_gap_1}px;

  ${Title}:only-child {
    margin-bottom: 0px !important;
  }
`;

export const SignatureListWrapper = styled(ScrollArea.AutoSize)`
  /* padding: var(--kiwi-spacing-1); */
  border-radius: var(--border-radius-primary);
  background-color: ${({ theme }) => theme.le_main_surface_container};
`;

export const CloseIconBtn = styled(IconButton)`
  z-index: 10;
  color: ${({ theme }) => theme.le_signature_on_signature_container};
`;

export const SignatureItemWrapper = styled.div`
  background-color: ${({ theme }) => theme.le_signature_signature_container};
  border-radius: 8px;
  height: 64px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacings.le_gap_1}px;
  cursor: pointer;

  &[data-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transition: background-color 0.3s ease;
    background-color: ${({ theme, $isDragging }) =>
      $isDragging ? theme.le_state_layer_signature_fixed_dragged : 'transparent'};
  }

  &:hover:not(:has(${CloseIconBtn}:hover))::after {
    background-color: ${({ theme }) => theme.le_state_layer_signature_fixed_hovered};
  }
`;

export const StatusWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_0_5}px;
  position: absolute;
  align-items: center;
  right: 4px;
  top: 4px;
`;

export const Img = styled.img`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: calc(100% - ${spacings.le_gap_2}px);
`;

export const BaseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
`;

export const DnDListWrapper = styled(BaseWrapper)``;

export const ListWrapper = styled(BaseWrapper)`
  margin-top: ${spacings.le_gap_1}px;
`;
