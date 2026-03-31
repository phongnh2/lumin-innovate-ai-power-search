import { makeStyles } from '@mui/styles';
import styled from 'styled-components';
import Menu from '@new-ui/general-components/Menu';
import { ZIndex } from 'constants/styles';
import { typographies as kiwiTypographies } from 'lumin-ui/tokens';

export const useStyle = makeStyles({
  inputRoot: {
    '&&': {
      cursor: 'pointer',
      paddingTop: '0px',
      paddingLeft: '0px',
      paddingBottom: '0px',
      flexWrap: 'nowrap',
      '& .MuiAutocomplete-endAdornment': {
        top: 'calc(50% - 10px)',
        right: 8,
        '& .MuiIconButton-root': {
          color: 'inherit',
        },
      },
    },
  },
  input: {
    userSelect: 'none',
    cursor: 'pointer',
  },
  popupIndicator: {
    marginRight: 0,
    display: 'flex',
  },
  noOptions: {
    fontFamily: 'var(--font-inter-variable)',
    ...kiwiTypographies.kiwi_typography_body_md,
  },
});

export const MenuComponent = styled(Menu)`
  z-index: ${ZIndex.POPOVER};
`;
