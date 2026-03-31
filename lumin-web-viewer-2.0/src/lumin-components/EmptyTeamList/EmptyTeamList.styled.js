import styled from 'styled-components';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledEmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const StyledEmptyImgContainer = styled.div`
  margin-bottom: 24px;
  margin-top: 32px;
  ${mediaQuery.md`
    margin-top: 64px;
  `}
  ${mediaQuery.xl`
    margin-top: 89px;
  `}
`;
export const StyledEmptyImg = styled.img`
  width: 100%;
  max-width: 296px;
  margin: 0 auto;
  display: block;
  ${mediaQuery.md`
    max-width: 350px;
  `}
`;
export const StyledCreateButton = styled(ButtonMaterial)`
  width: 200px;
  margin: 0 auto;
`;
