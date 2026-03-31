import InputBase from '@mui/material/InputBase';

import { makeStyles } from '@mui/styles';
import styled from 'styled-components';
import { spacings, typographies } from 'constants/styles/editor';

export const hextToRgba = (hex: string, alpha: number) => {
  let hexTail = '';
  if (hex.length === 4) {
    //NOTE #FFF for example, turn it to #FFFFFF
    hexTail = hex.substring(1);
  }
  const _alpha = ((alpha * 255) | (1 << 8)).toString(16).slice(1);
  return hex + hexTail + _alpha;
};

const getAdornedStyleBySize = (size: string) => {
  switch (size) {
    case 'small':
      return {
        paddingLeft: '3px',
        paddingRight: '3px',
      };

    case 'medium':
    case 'large':
    default:
      return {
        paddingLeft: '7px',
        paddingRight: '7px',
      };
  }
};

export const useStyles = makeStyles<any, { $size: string, theme: Record<string,string>, $variant: string }>({
  root: ({ theme }) => ({
    borderWidth: '1px',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    color: theme.le_main_on_surface_variant,
    borderColor: theme.le_main_outline_variant,
    '&:hover': {
      backgroundColor: theme.le_state_layer_on_surface_hovered,
      color: theme.le_main_on_surface,
    },
    '&:not(.Mui-disabled) .MuiInputAdornment-root': {
      cursor: 'pointer',
      color: theme.le_main_on_surface_variant,
    },
    '&.Mui-disabled': {
      backgroundColor: theme.le_disable_container,
      '& .MuiInputBase-input': {
        '-webkit-text-fill-color': theme.le_disable_on_container,
      }
    },
  }),
  focused: ({ theme, $variant }) => ({
    boxShadow: `0 0 0 ${$variant === 'autocomplete' ? '4px' : '2px'} ${theme.le_main_secondary_container}`,
    color: theme.le_main_on_surface,
    borderColor: theme.le_main_secondary + '!important',
    borderWidth: '1px!important',
  }),
  disabled: ({ theme }) => ({
    color: theme.le_disable_on_container,
    borderColor: 'transparent!important',
  }),
  adornedStart: ({ $size }) => ({
    ...getAdornedStyleBySize($size),
  }),
  adornedEnd: ({ $size }) => ({
    ...getAdornedStyleBySize($size),
  }),
  error: ({ theme }) => ({
    '&:not(.Mui-focused)': {
      borderColor: theme.le_error_error + '!important',
      borderWidth: '1px!important',
    },
  }),
  input: ({ $variant }) => ({
    paddingTop: 0,
    paddingBottom: 0,
    height: '100%',
    '&.MuiAutocomplete-input': {
      padding: $variant === 'autocomplete' ? 0 : '0px 0px 0px 14px!important',
    },
  }),
});

const getStyleBySize = (size: string, forStyleObject: boolean) => {
  switch (size) {
    case 'small': {
      return forStyleObject
        ? { ...typographies.le_body_small }
        : `
            border-radius: 4px;
            height: 24px;
            padding-left: ${spacings.le_gap_0_5}px;
            padding-right: ${spacings.le_gap_0_5}px;
          `;
    }

    case 'large': {
      return forStyleObject
        ? { ...typographies.le_body_large }
        : `
          border-radius: 8px;
          height: 44px;
          padding-left: ${spacings.le_gap_1}px;
          padding-right: ${spacings.le_gap_1}px;
        `;
    }

    case 'medium':
    default: {
      return forStyleObject
        ? { ...typographies.le_body_medium }
        : `
          border-radius: 8px;
          height: 32px;
          padding-left: ${spacings.le_gap_1}px;
          padding-right: ${spacings.le_gap_1}px;
        `;
    }
  }
};
//NOTE: apply style with style object first, then normal tag after.
export const TextField = styled(
  styled(InputBase)(({ $size }: { $size: string}) => ({
    ...(getStyleBySize($size, true) as Record<string, string>),
  }))
)`
  ${({ $size }) => getStyleBySize($size, false) as string}
`;

export const ErrorMessage = styled.p(({ theme }) => {
  return {
    ...typographies.le_body_small,
    color: theme.le_error_error,
    textAlign: 'left',
    margin: `${spacings.le_gap_1}px ${spacings.le_gap_0_5}px 0px ${spacings.le_gap_0_5}px`,
  };
});

export const TextFieldWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;
  width: 100%;

  &:focus-within {
    ${ErrorMessage} {
      display: none;
    }
  }
`;



export const Label = styled.span`
  ${{ ...typographies.le_label_medium }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
  margin-bottom: ${spacings.le_gap_0_25}px;
`;
