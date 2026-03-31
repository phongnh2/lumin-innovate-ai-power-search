import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div``;

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  ${mediaQuery.sm`
    flex-direction: row;
  `}
  ${mediaQuery.lg`
    max-width: 750px;
    margin: 0 auto;
  `}
`;

export const WrapperReskin = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  ${mediaQuery.sm`
    flex-direction: row;
  `}
  ${mediaQuery.lg`
    max-width: 656px;
    margin: 0 auto;
  `}
`;

export const ItemWrapper = styled('div')<{ $checked: boolean }>`
  display: flex;
  position: relative;
  flex-direction: column;
  border-radius: 8px;
  border: 2px solid ${(props) => (props.$checked ? Colors.NEUTRAL_90 : Colors.NEUTRAL_20)};
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: ${Colors.NEUTRAL_0};
  &:first-child {
    margin-bottom: 20px;
  }

  &:hover {
    background: ${Colors.NEUTRAL_5};
  }

  ${mediaQuery.sm`
    width: 50%;
    padding: 18px;
    &:first-child {
      margin: 0 16px 0 0;
    }
  `}

  ${mediaQuery.xl`
    &:first-child {
      margin: 0 24px 0 0;
    }
  `}
`;

export const ItemWrapperReskin = styled('div')<{ $checked: boolean }>`
  display: flex;
  position: relative;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$checked ? Colors.LUMIN_SIGN_PRIMARY : '#dbdde1')};
  padding: 12px 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: ${Colors.NEUTRAL_0};
  &:first-child {
    margin-bottom: 20px;
  }

  &:hover {
    background: ${Colors.NEUTRAL_5};
  }

  ${mediaQuery.sm`
    width: 50%;
    &:first-child {
      margin: 0 16px 0 0;
    }
  `}

  ${mediaQuery.xl`
    &:first-child {
      margin: 0 16px 0 0;
    }
  `}
`;

export const Group = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  cursor: pointer;

  ${mediaQuery.sm`
    margin-bottom: 8px;
  `}
`;

export const Text = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding-left: 10px;
  cursor: pointer;
  color: ${Colors.NEUTRAL_100};
  
  ${mediaQuery.sm`
    font-size: 17px;
    line-height: 24px;
    padding-left: 14px;
  `}
`;

export const TextReskin = styled.span`
  font-family: ${Fonts.SIGN_PRIMARY};
  font-size: 14px;
  font-weight: 500;
  line-height: 140%;
  padding-left: 10px;
  cursor: pointer;
  color: ${Colors.LUMIN_SIGN_PRIMARY};

  ${mediaQuery.sm`
    padding-left: 12px;
  `}
`;

export const ImageWrapper = styled.div`
  width: 20px;
  height: 20px;
`;

export const Image = styled.img`
  width: 100%;
  height: 100%;
`;

export const Input = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
`;

export const Description = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DescriptionLeft = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 375;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  ${mediaQuery.sm`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const DescriptionLeftReskin = styled.span`
  font-family: ${Fonts.SECONDARY};
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  ${mediaQuery.sm`
    font-size: 12px;
    line-height: 150%;
  `}
`;

export const DescriptionRight = styled.div`
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.PRIMARY_90};
  background-color: ${Colors.PRIMARY_30};
  border-radius: var(--border-radius-dense);
  padding: 2px 8px;
`;

export const DescriptionRightReskin = styled.div`
  font-family: ${Fonts.SECONDARY};
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  color: ${Colors.OTHER_27};
  background-color: ${Colors.LIGHT_CYAN};
  border-radius: 999px;
  padding: 1px 8px;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const Checkbox = styled.div<{ checked?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 100%;
  border: ${(props) => (props.checked ? `7px solid ${Colors.PRIMARY_90}` : `1px solid ${Colors.GRAY_3}`)};
`;

export const BillAnnual = styled.span`
  cursor: pointer;
  font-family: ${Fonts.PRIMARY};
  font-style: italic;
  font-weight: 505;
  font-size: 10px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  ${mediaQuery.sm`
    font-size: 12px;
    line-height: 16px;
  `}
`;

export const BillAnnualReskin = styled.span`
  cursor: pointer;
  font-family: ${Fonts.SECONDARY};
  font-style: italic;
  font-weight: 400;
  font-size: 10px;
  line-height: 150%;
  color: ${Colors.NEUTRAL_80};
`;

export const Discount = styled.div`
  cursor: pointer;
  background: ${Colors.SUCCESS_60};
  position: absolute;
  border-radius: 4px;
  padding: 5px 10px;
  font-family: ${Fonts.PRIMARY};
  font-weight: 600;
  font-size: 10px;
  line-height: 16px;
  color: ${Colors.WHITE};
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
`;

export const DiscountReskin = styled.div`
  cursor: pointer;
  background: ${Colors.PRIMARY_90};
  position: absolute;
  border-radius: 4px;
  padding: 1px 8px;
  font-family: ${Fonts.SECONDARY};
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  color: ${Colors.WHITE};
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
`;
