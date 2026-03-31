import { Colors } from 'constants/styles';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div``;
export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;
export const Title = styled.h4`
  color: ${Colors.NEUTRAL_80};
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
`;
export const GroupButton = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  margin-top: 16px;
`;
export const ChangeName = styled(ButtonMaterial)`
  height: auto;
  padding: 0;
  text-decoration: underline;
  &:hover {
    text-decoration: underline;
  }
  ${mediaQuery.md`
    padding: 6px 8px;
    height: 32px;
  `}
`;
export const Form = styled.form`
  ${mediaQuery.md`
    display: inline-grid;
    align-items: center;
    grid-template-columns: 1fr min-content;
    column-gap: 8px;
  `}
`;
export const InputWrapper = styled.div`
  ${mediaQuery.md`
    width: 456px;
  `}
`;
