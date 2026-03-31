import styled from 'styled-components';
import { colors, spacings, typographies } from 'constants/styles/editor';
import { THEME_MODE } from 'constants/lumin-common';

export const toastTheme = {
  [THEME_MODE.LIGHT]: {
    le_main_surface_container_lowest: colors.themes.light.le_main_surface_container_lowest,
    le_main_on_surface: colors.themes.light.le_main_on_surface,
    le_main_surface: colors.themes.light.le_main_surface,
    le_success_success: colors.themes.light.le_success_success,
    le_information_information_container: colors.themes.light.le_information_information_container,
    le_information_information: colors.themes.light.le_information_information,
    le_warning_warning_container: colors.themes.light.le_warning_warning_container,
    le_warning_warning: colors.themes.light.le_warning_warning,
    le_error_error_container: colors.themes.light.le_error_error_container,
    le_error_error: colors.themes.light.le_error_error,
    le_state_layer_on_surface_hovered: colors.themes.light.le_state_layer_on_surface_hovered,
    le_state_layer_success_hovered: colors.themes.light.le_state_layer_success_hovered,
    le_state_layer_information_hovered: colors.themes.light.le_state_layer_information_hovered,
    le_state_layer_warning_hovered: colors.themes.light.le_state_layer_warning_hovered,
    le_state_layer_error_hovered: colors.themes.light.le_state_layer_error_hovered,
    le_main_outline: colors.themes.light.le_main_outline,
    le_main_primary: colors.themes.light.le_main_primary,

    le_success_on_success_container: colors.themes.light.le_success_on_success_container,
    le_information_on_information_container: colors.themes.light.le_information_on_information_container,
    le_warning_on_warning_container: colors.themes.light.le_warning_on_warning_container,
    le_error_on_error_container: colors.themes.light.le_error_on_error_container,
    le_main_surface_variant: colors.themes.light.le_main_surface_variant,
    le_main_on_surface_variant: colors.themes.light.le_main_on_surface_variant,
  },
  [THEME_MODE.DARK]: {
    le_main_surface_container_lowest: colors.themes.dark.le_main_surface_container_lowest,
    le_main_on_surface: colors.themes.dark.le_main_on_surface,
    le_main_surface: colors.themes.dark.le_main_surface,
    le_success_success: colors.themes.dark.le_success_success,
    le_information_information_container: colors.themes.dark.le_information_information_container,
    le_information_information: colors.themes.dark.le_information_information,
    le_warning_warning_container: colors.themes.dark.le_warning_warning_container,
    le_warning_warning: colors.themes.dark.le_warning_warning,
    le_error_error_container: colors.themes.dark.le_error_error_container,
    le_error_error: colors.themes.dark.le_error_error,
    le_state_layer_on_surface_hovered: colors.themes.dark.le_state_layer_on_surface_hovered,
    le_state_layer_success_hovered: colors.themes.dark.le_state_layer_success_hovered,
    le_state_layer_information_hovered: colors.themes.dark.le_state_layer_information_hovered,
    le_state_layer_warning_hovered: colors.themes.dark.le_state_layer_warning_hovered,
    le_state_layer_error_hovered: colors.themes.dark.le_state_layer_error_hovered,
    le_main_outline: colors.themes.dark.le_main_outline,
    le_main_primary: colors.themes.dark.le_main_primary,


    le_success_on_success_container: colors.themes.dark.le_success_on_success_container,
    le_information_on_information_container: colors.themes.dark.le_information_on_information_container,
    le_warning_on_warning_container: colors.themes.dark.le_warning_on_warning_container,
    le_error_on_error_container: colors.themes.dark.le_error_on_error_container,
    le_main_surface_variant: colors.themes.dark.le_main_surface_variant,
    le_main_on_surface_variant: colors.themes.dark.le_main_on_surface_variant,
  },
};

export const Title = styled.span`
  ${{ ...typographies.le_title_small }};
`;

export const Message = styled.span`
  ${{ ...typographies.le_body_medium }};
`;

const getMainStyleByType = (type, theme) => {
  const _style = {
    neutral: {
      backgroundColor: theme.le_main_surface_container_lowest,
      color: theme.le_main_on_surface,
      [Message]: {
        color: theme.le_main_surface_variant
      }
    },
    success: {
      backgroundColor: theme.le_main_surface,
      color: theme.le_success_success,
      [Message]: {
        color: theme.le_success_on_success_container
      }
    },
    info: {
      backgroundColor: theme.le_information_information_container,
      color: theme.le_information_information,
      [Message]: {
        color: theme.le_information_on_information_container
      }
    },
    warning: {
      backgroundColor: theme.le_warning_warning_container,
      color: theme.le_warning_warning,
      [Message]: {
        color: theme.le_warning_on_warning_container
      }
    },
    error: {
      backgroundColor: theme.le_error_error_container,
      color: theme.le_error_error,
      [Message]: {
        color: theme.le_error_on_error_container
      }
    },
  };
  return _style[type] || _style.neutral;
};

const getHoverStyleByType = (type, theme) => {
  const _style = {
    neutral: {
      backgroundColor: theme.le_state_layer_on_surface_hovered,
    },
    success: {
      backgroundColor: theme.le_state_layer_success_hovered,
    },
    info: {
      backgroundColor: theme.le_state_layer_information_hovered,
    },
    warning: {
      backgroundColor: theme.le_state_layer_warning_hovered,
    },
    error: {
      backgroundColor: theme.le_state_layer_error_hovered,
    },
  };

  return _style[type] || _style.neutral;
};

export const ToastContainer = styled.div`
  width: 400px;
  padding: ${spacings.le_gap_1_5}px ${spacings.le_gap_0_5}px ${spacings.le_gap_1_5}px ${spacings.le_gap_1_5}px;
  display: flex;
  border-radius: var(--border-radius-primary);
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15);

  .close-btn {
    color: ${({ theme }) => theme.le_main_on_surface_variant};
    margin-left: ${spacings.le_gap_0_5}px;
    i:before {
      color: ${({ theme }) => theme.le_main_on_surface_variant};
    }
  }

  .action-btn {
    margin-left: ${spacings.le_gap_1}px;
  }

  .MuiButtonBase-root {
    z-index: 1;
  }

  ${({ theme, type }) => getMainStyleByType(type, theme)};
  position: relative;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &:hover {
    box-shadow: 0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
    &:after {
      ${({ theme, type }) => getHoverStyleByType(type, theme)};
    }
  }

  & b {
    font-weight: var(--font-weight-bold);
  }
`;

export const ToastMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  margin: 0px ${spacings.le_gap_0_5}px 0px ${spacings.le_gap_1}px;
  padding: ${spacings.le_gap_0_5}px 0px;
  z-index: 1;
  flex-grow: 1;
  word-break: break-word;
`;

export const Action = styled.div`
  min-width: 64px;
  height: 32px;
  padding: 8px 12px;
  border-radius: var(--border-radius-primary);
  text-align: center;
  z-index: 1;
  ${{ ...typographies.le_label_small }};
  ${({ theme }) =>
    `
    border: 1px solid ${theme.le_main_outline};
    color: ${theme.le_main_primary} !important;
  `};
`;

export const Icon = styled.div`
  width: 24px;
  height: 24px;
  padding: ${spacings.le_gap_0_25}px;
  padding-top: ${spacings.le_gap_0_5 + spacings.le_gap_0_25}px;
  z-index: 1;
`;

export const IconAndContentWrapper = styled.div`
  display: flex;
`