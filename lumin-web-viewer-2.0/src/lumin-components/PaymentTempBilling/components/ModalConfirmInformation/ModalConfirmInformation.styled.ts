import styled from 'styled-components';
import { Colors } from 'constants/styles/Colors';
import Icomoon from 'lumin-components/Icomoon';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  `;

export const LeftWrapper = styled.div`
`;

export const CoverImage = styled.img`
  width: 100%;
  display: block;
  `;

export const RightWrapper = styled.div`
  ${(props: { $hasDivider: boolean }) => props.$hasDivider && `
    display: grid;
    grid-template-columns: 1px 1fr;
  `};
`;

export const Divider = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${Colors.OTHER_4};
`;

export const Content = styled.div`
  margin: 22px 24px 24px;
  margin-left: ${(props: { $hasDivider: boolean }) => props.$hasDivider ? '23px' : '24px'};
  `;

export const Title = styled.h3`
  font-family: var(--font-primary);
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
`;

export const Description = styled.h5`
  margin-top: 12px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
`;

export const Tools = styled.div`
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 24px;
`;

export const Tool = styled.div`
  padding-bottom: 12px;
  display: flex;
`;


export const IconWrapper = styled(Icomoon)`
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

export const Note = styled.div`
  margin-top: 12px;
`;

export const ButtonWrapper = styled.div`
  margin-top: 24px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;
