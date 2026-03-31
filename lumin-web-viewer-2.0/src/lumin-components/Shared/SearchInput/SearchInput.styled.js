import styled from 'styled-components';
import { makeStyles } from '@mui/styles';

import { Colors } from 'constants/styles';
import CircularLoading from 'lumin-components/CircularLoading';

export const useStyles = makeStyles({
  popper: {
    width: 452,
    zIndex: '1301!important',
    boxSizing: 'border-box',
  },
});

export const StyledRowWrapper = styled.div`
  padding: 0 16px;
  height: 54px;
  display: flex;
  align-items: center;
`;

export const StyledText = styled.p`
  font-size: 14px;
  font-weight: ${(props) => props.fontWeight || 600};
  font-stretch: normal;
  font-style: ${(props) => (props.italic ? 'italic' : 'normal')};
  line-height: 1.43;
  letter-spacing: 0.34px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledTextLight = styled(StyledText)`
  color: ${Colors.NEUTRAL_80};
`;

export const StyledLoading = styled(CircularLoading)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
`;
