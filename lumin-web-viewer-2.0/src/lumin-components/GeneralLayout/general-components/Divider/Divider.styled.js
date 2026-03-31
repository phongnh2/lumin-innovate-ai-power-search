import { THEME_MODE } from 'constants/lumin-common';
import { makeStyles } from '@mui/styles';
import { spacings } from 'constants/styles/editor';

export const useStyles = makeStyles({
  root: ({ theme }) => ({
    backgroundColor: theme.le_main_outline_variant,
    margin: `${spacings.le_gap_1}px 0px`,
  }),
  classes: () => ({
    margin: 0,
  }),
});
