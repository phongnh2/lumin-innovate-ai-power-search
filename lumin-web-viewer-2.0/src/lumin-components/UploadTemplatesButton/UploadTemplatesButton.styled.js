import styled from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled(ButtonMaterial)`
  display: none;
  ${mediaQuery.md`
    display: flex;
    align-items: center;
  `}
`;
export const Text = styled.span`
  display: inline-block;
  margin: 0 12px 0 10px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-transform: none;
`;
