import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';

export const Container = styled.div`
  margin-top: 16px;
`;

export const ContainerReskin = styled.div`
  margin-top: 24px;
`;

export const Text = styled.p`
  margin-bottom: 16px;
  color: ${Colors.NEUTRAL_80};
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
`;

export const TextReskin = styled.p`
  font-family: ${Fonts.SECONDARY};
  margin-bottom: 16px;
  padding: 0 24px;
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  font-size: 12px;
  font-weight: 500;
  line-height: 150%;
`;

export const Link = styled.a`
  display: inline;
  color: ${Colors.PRIMARY_80};
  font-weight: 600;
  text-decoration: underline;
`;

export const LinkReskin = styled.a`
  display: inline;
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  font-size: 12px;
  font-weight: 500;
  line-height: 150%;
  text-decoration: underline;
`;

export const Message = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: ${Colors.OTHER_26};

  p {
    margin: 0 8px;
    font-family: ${Fonts.SECONDARY};
    font-size: 12px;
    font-weight: 500;
    line-height: 150%;
    color: ${Colors.LUMIN_SIGN_PRIMARY};
  }
`;
