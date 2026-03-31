import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
  root: ({ theme }) => ({
    backgroundColor: theme.le_main_primary_container,
    borderRadius: 9999999,
  }),
  bar: ({ theme }) => ({
    backgroundColor: theme.le_main_primary,
  }),
});
