import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
  thumb: ({ theme }) => ({
    color: theme.le_main_inverse_surface,
    border: `1px solid ${theme.le_main_outline}`,
    width: 16,
    height: 16,
    boxShadow: 'none!important',
    '&:after': {
      width: 0,
      height: 0,
    },
  }),
  track: ({ theme }) => ({
    color: theme.le_main_on_surface_variant,
    marginLeft: -2,
    marginRight: -2,
  }),
  rail: ({ theme }) => ({
    color: theme.le_main_outline_variant,
    opacity: 1,
    marginLeft: -2,
    marginRight: -2,
    width: 'calc(100% + 4px)',
  }),
});
