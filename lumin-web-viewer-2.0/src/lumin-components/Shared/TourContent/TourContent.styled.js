import styled from 'styled-components';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ImageStep = styled.img`
  width: 80px;
  margin-bottom: 16px;
`;

export const Title = styled.h1`
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
`;

export const Content = styled.p`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  text-align: center;
`;
