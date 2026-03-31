import { makeStyles } from '@mui/styles';
import styled, { css } from 'styled-components';

import { typographies, spacings, opacities } from 'constants/styles/editor';

const getCorrectPaddingRight = (withSuffix: boolean) => {
  if (withSuffix)
    return {
      paddingRight: '0px!important',
    };

  return {};
};

const renderStyleBySize = (size: 'small' | 'medium' | 'large', withSuffix: boolean) => {
  switch (size) {
    case 'small': {
      return {
        padding: `${spacings.le_gap_0_5}px ${spacings.le_gap_1}px !important`,
        borderRadius: 4,
        minHeight: 32,
        ...getCorrectPaddingRight(withSuffix),
      };
    }

    case 'medium': {
      return {
        padding: `${spacings.le_gap_1}px ${spacings.le_gap_1}px !important`,
        borderRadius: 8,
        minHeight: 40,
        ...getCorrectPaddingRight(withSuffix),
      };
    }

    case 'large': {
      return {
        padding: `${spacings.le_gap_1_5}px ${spacings.le_gap_1_25}px !important`,
        borderRadius: 10,
        minHeight: 48,
        ...getCorrectPaddingRight(withSuffix),
      };
    }
    default: {
      return {};
    }
  }
};

type UseMenuItemStyleParams = {
  theme: Record<string, string>;
  $size: 'small' | 'medium' | 'large';
  $hideIcon: boolean;
  $withSuffix: boolean;
  $activated: boolean;
  $alignMenuItems: 'top' | 'center' | 'bottom';
};

const alignMapping = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

export const useMenuItemStyle = makeStyles({
  root: ({ theme, $size, $hideIcon, $withSuffix, $activated, $alignMenuItems = 'center' }: UseMenuItemStyleParams) => ({
    ...renderStyleBySize($size, $withSuffix),
    ...typographies.le_body_medium,
    color: $activated ? theme.le_main_on_primary_container : theme.le_main_on_surface,
    display: 'flex',
    alignItems: alignMapping[$alignMenuItems],
    '&:hover': {
      backgroundColor: $activated ? 'var(--kiwi-colors-core-primary-container)' : 'unset',
    },
    '.MuiAutocomplete-option.Mui-focused&:hover::before, &:hover::before': {
      borderRadius: 'var(--kiwi-border-radius-md)',
      backgroundColor: 'var(--kiwi-colors-surface-on-surface)',
      opacity: 'var(--kiwi-opacity-state-layer-hovered)',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    '.MuiAutocomplete-option&:hover::before': {
      backgroundColor: 'unset',
    },
    ...($activated
      ? {
          backgroundColor: 'var(--kiwi-colors-core-primary-container)',
        }
      : {}),
    '& >.icon, & >.SvgElement, & > [class^=kiwi-icon-]': {
      opacity: $hideIcon ? 0 : 1,
      marginRight: spacings.le_gap_1,
    },
    '&.Mui-disabled': {
      opacity: opacities.le_opacity_on_container_disable,
    },

    '&.Mui-selected': {
      backgroundColor: theme.le_state_layer_on_surface_hovered,
    },
  }),
});

export const useMenuStyle = makeStyles({
  root: ({ theme }: { theme: Record<string, string> }) => ({
    padding: spacings.le_gap_1,
    ...typographies.le_body_medium,
    color: theme.le_main_on_surface,
    '& .MuiAutocomplete-option': {
      borderRadius: 'var(--kiwi-border-radius-sm)',
      padding: 0,
    },

    '& .MuiAutocomplete-option[aria-selected="true"], .MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
      backgroundColor: 'var(--kiwi-colors-core-primary-container)',
    },

    '& .MuiAutocomplete-option.Mui-focused': {
      backgroundColor: 'unset',
    },

    '& .Mui-focusVisible.MuiAutocomplete-option::before': {
      backgroundColor: 'var(--kiwi-colors-surface-on-surface)',
      opacity: 'var(--kiwi-opacity-state-layer-pressed)',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }),
});

export const DummyPrefix = styled.div`
  height: 24px;
  width: 24px;
  margin-right: ${spacings.le_gap_1}px;
  flex-shrink: 0;
`;

export const MenuItemText = styled.span`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
`;

export const ListItemContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  flex-grow: 1;
  min-width: 1px;
  gap: ${spacings.le_gap_0_5}px;

  ${({ $withPrefix, $withSuffix }: { $withPrefix?: boolean; $withSuffix?: boolean }) => `
    margin-left: ${$withPrefix ? spacings.le_gap_2 : 0}px;
    margin-right: ${$withSuffix ? spacings.le_gap_2 : 0}px;
  `}
`;

export const ListItemTitle = styled.span<{ $inheritFont: boolean }>`
  ${{ ...typographies.le_body_medium }}
  display: flex;
  ${(props) =>
    props.$inheritFont &&
    css`
      font-family: inherit;
    `}
`;

export const ListItemHeadline = styled.span`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${({ theme }) => css`
    color: ${theme.le_main_on_surface};
  `}
`;
export const ListItemSecondaryHeadline = styled.span`
  flex-shrink: 0;
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `}
`;

export const ListItemDesc = styled.span`
  ${{ ...typographies.le_body_small }}
  white-space: pre-wrap;
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `}
`;

export const PrefixWrapper = styled.div``;
export const SuffixContent = styled.div`
  display: inline-block;
  position: absolute;
  top: 50%;
  right: ${spacings.le_gap_0_5}px;
  transform: translateY(-50%);
`;
export const SuffixWrapper = styled.div`
  flex-shrink: 0;
  height: 24px;
  width: 64px;
  position: relative;
`;

export const ListItemBaseWrapper = styled.div<{ $disabled: boolean }>`
  ${({ $disabled }) =>
    $disabled
      ? `
    opacity: ${opacities.le_opacity_on_container_disable};
  `
      : ''}
`;

export const useListItemStyle = makeStyles({
  root: ({ theme }: { theme: Record<string, string> }) => ({
    display: 'flex',
    width: '100%',
    height: '56px',
    alignItems: 'flex-start',
    userSelect: 'none',
    padding: `${spacings.le_gap_1}px`,
    '&:hover': {
      backgroundColor: theme.le_state_layer_on_surface_hovered,
    },
    '&.Mui-disabled': {
      opacity: opacities.le_opacity_on_container_disable,
    },
  }),
});
