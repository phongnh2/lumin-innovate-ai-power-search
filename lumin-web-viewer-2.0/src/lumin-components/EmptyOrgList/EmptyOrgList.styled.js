import styled from 'styled-components';

import ButtonMaterial from 'luminComponents/ButtonMaterial';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors, Fonts } from 'constants/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;

  ${mediaQuery.sm`
    margin-top: 81px;
  `}

  ${mediaQuery.sm`
    margin-top: 64px;
  `}
`;

export const ImgContainer = styled.div`
  margin-bottom: 34px;

  ${({ $isFromPlan }) => $isFromPlan && `
    margin-bottom: 26px;
  `}

  ${mediaQuery.sm`
    margin-bottom: 34px;

    ${({ $isFromPlan }) => $isFromPlan && `
      margin-bottom: 36px;
    `}
  `}
`;

export const Img = styled.img`
  width: 100%;
  max-width: 264px;
  margin: 0 auto;
  display: block;

  ${mediaQuery.sm`
    max-width: 400px;
  `}

  ${mediaQuery.lg`
    max-width: 480px;
  `}
`;

export const CreateButton = styled(ButtonMaterial)`
  width: 230px;
`;

export const CreateOrgFirst = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;

  ${mediaQuery.sm`
    margin-bottom: 18px;
  `}

  ${mediaQuery.lg`
    margin-bottom: 26px;
  `}
`;

export const CreateOrgFirstText = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.PRIMARY_90};
  margin-left: 16px;
`;
