import { makeStyles } from '@mui/styles';

import { Colors } from 'constants/styles';

const DEFAULT_FONT_SIZE = '12px';

const getPadding = ({ size }) =>
  ({
    SM: '0 6px',
    MD: '2px 8px',
  }[size]);

const getFontSize = ({ size }) =>
  ({
    SM: '10px',
    MD: '12px',
  }[size] || DEFAULT_FONT_SIZE);

export const useStyles = makeStyles({
  root: {
    backgroundColor: (props) => props.backgroundColor || Colors.NEUTRAL_100,
    padding: getPadding,
    borderRadius: 4,
    height: 20,
  },
  label: {
    color: (props) => props.color || Colors.WHITE,
    fontSize: (props) => props.font?.size || getFontSize(props),
    lineHeight: '16px',
    fontWeight: (props) => props.font?.weight || 600,
    padding: 0,
    display: 'block',
  },
  icon: {
    margin: (props) => (props.hasIcon ? '0 4px 0 0 !important' : '0'),
  },
});
