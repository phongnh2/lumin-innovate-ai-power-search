import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
  root: ({ theme }) => ({
    padding: 0 + '!important',
    width: 40,
    height: 24,
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(17px)'
    },
    '& .MuiSwitch-switchBase': {
      width: 24,
      height: 24,
      padding: 0 + '!important'
    },
    '& .MuiSwitch-track': {
      borderRadius: 999999,
      backgroundColor: theme.le_main_surface_container_highest,
      height: 'calc(100% - 2px)',
      border: `1px solid ${theme.le_main_outline}`
    },
    '& .Mui-checked + .MuiSwitch-track': {
      backgroundColor: theme.le_main_primary + '!important',
      opacity: 1,
      border: '1px solid transparent'
    },
    '& .Mui-checked .MuiSwitch-thumb': {
      backgroundColor: theme.le_main_on_primary + '!important',
    },
    '& .MuiSwitch-thumb': {
      boxShadow: 'none',
      width: 16,
      height: 16,
      margin: 3,
      backgroundColor: theme.le_main_on_surface_variant
    },
  }),
});
