import { makeStyles } from '@mui/styles';
import { typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const useStyles = makeStyles({
  root: ({ theme, $thickness, $size }) => ({
    color: theme.le_main_primary,
    borderRadius: '50%',
    boxShadow: `inset 0 0 0 ${($thickness / 44) * $size}px ${theme.le_main_primary_container}`,
  }),
  circle: () => ({
    strokeLinecap: 'round',
  }),
});

export const Content = styled.span`
  ${{ ...typographies.le_label_medium }}
  text-align: center;
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
    `}
`;

export const Wrapper = styled.div`
  position: relative;
`