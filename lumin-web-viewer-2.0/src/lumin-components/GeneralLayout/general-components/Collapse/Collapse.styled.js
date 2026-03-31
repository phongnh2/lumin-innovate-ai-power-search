import styled from 'styled-components';
import { spacings, typographies } from 'constants/styles/editor';
import ButtonBase from '@mui/material/ButtonBase';

export const Header = styled(ButtonBase)`
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding-left: ${spacings.le_gap_1}px;

  > .MuiButtonBase-root {
    pointer-events: none;
    transform: ${({ $open }) => ($open ? 'rotateX(180deg)' : 'rotateX(0deg)')};
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }
`;

export const Title = styled.span`
  ${{ ...typographies.le_title_medium }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const Container = styled.div`
  padding: ${spacings.le_gap_1}px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.le_main_surface_container_low};
`;