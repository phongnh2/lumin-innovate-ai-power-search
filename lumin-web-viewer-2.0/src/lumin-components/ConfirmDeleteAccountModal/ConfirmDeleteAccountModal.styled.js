import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import Input from 'lumin-components/Shared/Input';

export const Title = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  margin: 16px 0 8px;
  text-align: center;
`;

export const SubTitle = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  text-align: center;
  margin-bottom: 24px;
`;

export const InputWrapper = styled.div`
  margin-bottom: 24px;
`;

export const CustomInput = styled(Input)``;

export const ButtonWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

export const TitlePassword = styled(Title)`
  margin: 0 0 0 16px;
`;

export const SubTitlePassword = styled(SubTitle)`
  text-align: left;
`;
