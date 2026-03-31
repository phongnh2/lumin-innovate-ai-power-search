import { Colors } from 'constants/styles';
import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Logo = styled.div`

`;

export const ProgressBar = styled.div`
  width: 160px;
  height: 6px;
  border-radius: 99px;
  background: ${Colors.SECONDARY_20};
  overflow: hidden;
`;

export const ProgressBarTrack = styled.div`
  width: 0;
  background: ${Colors.SECONDARY_50};
  height: 6px;
`;
