import styled from 'styled-components';
import { makeStyles } from '@mui/styles';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  display: inline-flex;
  align-items: center;
`;
const getActiveStyle = (...params) => (props) => (props.active ? params[0] : params[1]);
const getDisabledStyle = (...params) => (props) => (props.disabled ? params[0] : params[1]);
export const useStyles = makeStyles({
  root: {
    width: 40,
    height: 40,
    borderRadius: 6,
    border: 'var(--border-secondary)',
    marginRight: 6,
    minWidth: 40,
    color: getActiveStyle(Colors.WHITE, Colors.NEUTRAL_60),
    padding: 0,
    fontSize: 14,
    lineHeight: '14px',
    borderColor: getActiveStyle(Colors.SECONDARY_50, Colors.NEUTRAL_20),
    backgroundColor: getActiveStyle(Colors.SECONDARY_50, 'transparent'),
    opacity: getDisabledStyle(0.6, 1),
    '&:last-child': {
      marginRight: 0,
    },
    '&:hover': {
      borderColor: Colors.SECONDARY_50,
      color: getActiveStyle(Colors.WHITE, Colors.SECONDARY_50),
      backgroundColor: getActiveStyle(Colors.SECONDARY_50, 'transparent'),
    },
  },
  disabled: {
    '&&': {
      color: getActiveStyle(Colors.WHITE, Colors.NEUTRAL_60),
    },
  },
});
