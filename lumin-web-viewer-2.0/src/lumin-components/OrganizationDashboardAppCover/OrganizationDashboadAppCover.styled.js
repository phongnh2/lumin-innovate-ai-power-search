import styled from 'styled-components';
import { Fonts } from 'constants/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const ImageInformation = styled.img`
  height: 48px;
  width: 48px;
`;
export const Description = styled.p`
  text-align: center;
  margin: 16px 0;
  font-family: ${Fonts.PRIMARY};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
