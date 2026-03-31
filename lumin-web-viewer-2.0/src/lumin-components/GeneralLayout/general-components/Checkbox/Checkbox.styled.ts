import MuiCheckbox from '@mui/material/Checkbox';
import styled from 'styled-components';
import { makeStyles } from '@mui/styles';

export const hextToRgba = (hex: string, alpha: number) => {
  let hexTail = '';
  if (hex.length === 4) {
    //NOTE #FFF for example, turn it to #FFFFFF
    hexTail = hex.substring(1);
  }
  const _alpha = ((alpha * 255) | (1 << 8)).toString(16).slice(1);
  return hex + hexTail + _alpha;
};

export const Checkbox = styled(MuiCheckbox)``;

export const useStyles = makeStyles({
  root: ({ theme }: { theme: Record<string, string> }) => ({
    color: theme.le_main_on_surface_variant,
    borderRadius: '8px!important',
    padding: '4px',
    width: '32px',
    height: '32px',
    '&:hover': {
      backgroundColor: theme.le_state_layer_on_surface_variant_hovered + '!important',
    },
  }),
  checked: ({ theme }) => ({
    color: theme.le_main_on_surface_variant + '!important',
  }),
  disabled: ({ theme }) => ({
    color: theme.le_disable_on_container + '!important',
  }),
});
