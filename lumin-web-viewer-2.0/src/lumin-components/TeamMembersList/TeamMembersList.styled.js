import { makeStyles } from '@mui/styles';
import { Colors } from 'constants/styles';

export const useStyle = makeStyles({
  TeamMemberList: {
    '&&': {
      background: Colors.WHITE,
      width: '50px',
      height: '24px',
      padding: '4px 2px 4px 8px',
      margin: '0 0 0 12px',
      fontWeight: 600,
      borderRadius: '4px',
      border: `1px solid ${Colors.NEUTRAL_20}`,
      '& ul': {
        overflowY: 'hidden',
        '& li:nth-child(n)': {
          padding: '0 12px',
          height: '40px',
          textAlign: 'center',
          '& div div': {
            margin: 'auto',
            width: '100%',
            flexShrink: 0,
          },
        },
      },
    },
  },
});
