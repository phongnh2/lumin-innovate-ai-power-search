import { Colors, Fonts } from 'constants/styles';
import styled from 'styled-components';

export const Container = styled.div`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: white;
  padding: 4px 16px;
  background: ${Colors.OTHER_3};
  border-radius: 99px;
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
`;
