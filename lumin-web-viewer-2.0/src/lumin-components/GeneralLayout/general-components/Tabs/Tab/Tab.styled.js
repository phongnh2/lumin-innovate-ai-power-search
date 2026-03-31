import styled from 'styled-components';
import { Tab, tabClasses } from '@mui/base/Tab';
import { buttonClasses } from '@mui/material';
import { typographies, colors, spacings } from 'constants/styles/editor';
import { THEME_MODE } from 'constants/lumin-common';

export const tabTheme = {
  [THEME_MODE.LIGHT]: {
    le_main_on_surface_variant: colors.themes.light.le_main_on_surface_variant,
    le_main_on_primary_container: colors.themes.light.le_main_on_primary_container,
    le_main_primary_container: colors.themes.light.le_main_primary_container,
    le_main_primary: colors.themes.light.le_main_primary,
    le_main_surface_container: colors.themes.light.le_main_surface_container,
  },
  [THEME_MODE.DARK]: {
    le_main_on_surface_variant: colors.themes.dark.le_main_on_surface_variant,
    le_main_on_primary_container: colors.themes.dark.le_main_on_primary_container,
    le_main_primary_container: colors.themes.dark.le_main_primary_container,
    le_main_primary: colors.themes.dark.le_main_primary,
    le_main_surface_container: colors.themes.dark.le_main_surface_container,
  },
};

export const BaseTab = styled(Tab)`
  ${{ ...typographies.le_label_large }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
  background-color: transparent;
  width: 100%;
  padding: 8px 18px;
  border: none;
  border-radius: 99999px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.1s ease;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.le_state_layer_on_surface_hovered};
  }

  &.${tabClasses.selected} {
    color: ${({ theme }) => theme.le_main_on_primary_container};
    background-color: ${({ theme }) => theme.le_main_primary_container};
  }

  &.${buttonClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.le_gap_0_5}px;
`;

export const Label = styled.span`
  ${{ ...typographies.le_label_large }}
`;

export const PrimaryTab = styled(BaseTab)`
  &.${tabClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryTab = styled(BaseTab)`
  height: 58px;
  border-radius: 16px;
  padding-top: ${spacings.le_gap_0_5}px;
  padding-bottom: ${spacings.le_gap_1 + 2}px;

  ${ContentWrapper} {
    flex-direction: column;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      bottom: -10px;
      background-color: transparent;
      border-top-left-radius: 99999px;
      border-top-right-radius: 99999px;
      transition: all 0.1s ease;
    }
  }

  &.${tabClasses.selected} {
    color: ${({ theme }) => theme.le_main_primary};
    background-color: transparent;

    ${ContentWrapper} {
      &::after {
        background-color: ${({ theme }) => theme.le_main_primary};
      }
    }
  }
`;

export const TertiaryTab = styled(BaseTab)`
  height: 26px;
  border-radius: 0px;
  padding-top: ${spacings.le_gap_0_5}px;
  padding-bottom: ${spacings.le_gap_0_5 + 2}px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    bottom: -1px;
    background-color: transparent;
    transition: all 0.1s ease;
  }

  &.${tabClasses.selected} {
    color: ${({ theme }) => theme.le_main_primary};
    background-color: transparent;

    &::after {
      background-color: ${({ theme }) => theme.le_main_primary};
    }
  }
`;
