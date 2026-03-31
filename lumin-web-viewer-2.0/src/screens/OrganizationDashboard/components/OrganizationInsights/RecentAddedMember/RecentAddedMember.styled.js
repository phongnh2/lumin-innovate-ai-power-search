import { Colors, Fonts } from 'constants/styles';
import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: 32px auto auto;
  column-gap: 12px;
  padding: 12px 24px;
`;
export const ContainerName = styled.div`

`;
export const StyledName = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  word-break: break-word;
`;

export const StyledEmail = styled.p`
  margin-top: 4px;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  word-break: break-all;
`;

export const StyledJoinDate = styled.p`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  text-align: right;
  align-self: center;
`;

export const StyledNameLoading = styled.div`
  margin-bottom: 4px;
`;

export const StyledJoinDateLoading = styled.div`
  display: flex;
  justify-content: flex-end;
  text-align: right;
  align-self: center;
`;

export const StyledBodyLoading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
