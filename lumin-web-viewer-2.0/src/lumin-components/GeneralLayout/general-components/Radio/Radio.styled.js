import MuiRadio from '@mui/material/Radio';
import styled from 'styled-components';
import { makeStyles } from '@mui/styles';
import { typographies } from 'constants/styles/editor';

export const Radio = styled(MuiRadio)``;

export const useStyles = makeStyles({
  root: ({ theme }) => ({
    color: theme.le_main_on_surface_variant,
    width: '32px!important',
    height: '32px!important',
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
})