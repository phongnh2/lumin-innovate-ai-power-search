import styled from 'styled-components';
import { Checkbox } from 'lumin-ui/kiwi-ui'
import { mediaQuery } from 'utils/styles/mediaQuery';
import CustomCheckbox from 'luminComponents/CustomCheckbox';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { Colors } from 'constants/styles';

export const StyledWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  z-index: 101;
  position: fixed;
  bottom: -64px;
  left: 0;
  height: 64px;
  background-color: var(--color-primary-90);
  padding: 0 16px;
  transform: ${({ $isDisplay }) => `translate3d(0, ${$isDisplay ? '-64px' : 0}, 0)`};
  transition: transform 0.3s ease;
  
  ${mediaQuery.md`
    justify-content: flex-start;
    bottom: auto;
    height: auto;
    background-color: transparent;
    transform: translate3d(0, 0, 0);
    transition: none;
    display: ${({ $isDisplay }) => ($isDisplay ? 'flex' : 'none')};
    position: static;
    padding: 0 0 12px;
  `}
`;
export const StyledText = styled.p`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  margin: 0;
  ${mediaQuery.md`
    color: var(--color-neutral-100);
    margin-left: 8px;
  `}
  ${mediaQuery.xl`
    margin-left: 0;
  `}
`;
export const StyledDivider = styled.div`
  display: none;
  ${mediaQuery.md`
    display: block;
    background-color: var(--color-neutral-20);
    width: 1px;
    height: 32px;
    margin: 0 16px;
  `}
`;
export const StyledButton = styled(ButtonMaterial)`
  width: 40px;
  min-width: auto;
  ${mediaQuery.md`
    width: auto;
  `}
`;
export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  ${StyledButton} {
    &:first-child {
      margin-right: 16px;
    }
  }
  ${mediaQuery.md`
    margin-left: 0;
  `}
`;
export const StyledTextButton = styled.p`
  display: none;
  line-height: 1.43;

  ${mediaQuery.md`
    display: block;
    margin-left: 12px;
  `}
`;
export const StyledCheckBox = styled(CustomCheckbox)`
  display: flex;
  justify-content: center;
  margin-right: 12px;
  padding: 0;
  ${mediaQuery.xl`
    background-color: ${Colors.WHITE};
    position: absolute;
    left: -48px;
    z-index: 2;
    padding: 9px;
  `}
`;

export const StyledCancelSelection = styled.span`
  font-size: 14px;
  line-height: 1.33;
  font-weight: 600;
  color: var(--color-secondary-50);
  cursor: pointer;
  display: none;
  margin-left: auto;
  ${mediaQuery.md`
    display: inline-block;
  `}
  ${mediaQuery.xl`
    display: none;
  `}
`;
