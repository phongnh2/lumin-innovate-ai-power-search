import MuiIconButton from '@mui/material/IconButton';
import AutosizeInput from 'react-18-input-autosize';
import styled, { css, keyframes } from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

const BaseContainer = css`
  ${({ theme }) =>
    css`
      &:hover {
        background-color: ${theme.le_state_layer_on_surface_hovered} !important;
        border-radius: var(--border-radius-primary);
      }
    `}
`;

const rotate = keyframes`to{ transform: rotate(360deg); }`;

const rotateAnimation = css`
  transform-origin: 50% 50%;
  animation: ${rotate} 1.5s linear infinite;
`;

export const LogoButton = styled(MuiIconButton)`
  padding: 0;
  background-color: transparent !important;
`;

const BaseLogoOverlay = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
`;

export const BackBtn = styled(BaseLogoOverlay)`
  ${({ theme }) => `
    background-color: ${theme.le_state_layer_on_surface_variant_hovered} ;
    color: ${theme.le_main_on_surface_variant};
  `}
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

export const DummyOverlay = styled(BaseLogoOverlay)`
  ${({ theme }) => `
    background-color: ${theme.le_main_surface};
  `}
  z-index: 1;
`;

export const LogoContainer = styled.div`
  height: 48px;
  min-width: 48px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  &:hover {
    ${BackBtn}, ${DummyOverlay} {
      opacity: 1;
    }
  }
`;

export const DocumentNameContainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  min-width: 40px;
  border-radius: 8px;
  border: 1px solid transparent;

  &:hover {
    border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
  }
`;

export const DocumentName = styled(AutosizeInput)`
  /* Override inline style */
  display: flex !important;
  height: 32px;
  min-width: 40px;
  align-items: center;
  ${BaseContainer}
  & input {
    max-width: 100%;
    min-width: 40px;
    height: 30px;
    border: none;
    padding: 0 ${spacings.le_gap_1}px;
    background-color: transparent !important;
    text-overflow: ellipsis;
    ${{ ...typographies.le_title_small }}
    &:hover {
      border-radius: var(--border-radius-primary);
    }
    ${({ theme }) =>
      `
      border: 1px solid transparent;
      color: ${theme.le_main_on_surface} !important;
      &:focus {
        border-radius: var(--border-radius-primary);
        outline: 2px solid ${theme.le_main_secondary_container} !important;
        background-color: ${theme.le_main_surface_container};
        border: 1px solid ${theme.le_main_secondary};
      }
    `}
  }
`;

export const FileStatus = styled.div`
  display: flex;
  align-items: center;
  max-height: 24px;
  padding: 4px;
  gap: 4px;

  ${({ theme }) =>
    css`
      color: ${theme.le_main_on_surface_variant} !important;
    `}
  ${{ ...typographies.le_label_small }}
  font-weight: 480;
  line-height: 16px;
  white-space: nowrap;
  background-color: transparent;
  border-radius: 8px;
  transition: background-color 0.2s ease-in-out;
  [data-allow-hover-state='true'] {
    cursor: pointer;
    &:hover {
      background-color: ${({ theme }) => theme.le_state_layer_on_surface_variant_hovered};
    }
  }
`;

export const RestoreOriginalLink = styled.div`
  text-decoration: underline;
  cursor: pointer;
`;

export const LeftSection = styled.div`
  display: flex;
  width: 50%;
  align-items: center;
  gap: ${spacings.le_gap_0_5}px;
`;

export const OriginalDocumentName = styled.p`
  ${{ ...typographies.le_label_medium }}
  ${({ theme }) =>
    `
    color: ${theme.le_main_on_surface};
  `}
  margin: auto;
  margin-left: 8px;
`;

export const RotateIcon = styled.div`
  > i {
    ${rotateAnimation};
  }
`;
