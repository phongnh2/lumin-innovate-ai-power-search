import styled from 'styled-components';
import MessageBox from 'lumin-components/Shared/MessageBox';

import { Colors, Fonts, Shadows } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Title = styled.h2`
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: ${Colors.WHITE};
  box-sizing: border-box;
  height: 64px;
  padding: 16px;
  background-color: ${Colors.PRIMARY_90};
  border-top-left-radius: var(--border-radius-primary);
  border-top-right-radius: var(--border-radius-primary);
  ${mediaQuery.md`
    height: 72px;
    padding: 18px 32px;
    font-size: 29px;
    line-height: 36px;
  `}
`;

export const TitleReskin = styled.h2`
  font-family: ${Fonts.SIGN_PRIMARY};
  font-weight: 500;
  font-size: 18px;
  line-height: 140%;
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  box-sizing: border-box;
  padding: 12px 24px;
  background-color: ${Colors.OTHER_25};
`;

export const Container = styled.div`
  margin-bottom: 24px;
`;

export const InfoContainer = styled.div`
  border-top-left-radius: var(--border-radius-primary);
  border-top-right-radius: var(--border-radius-primary);
  background-color: ${Colors.WHITE};
  box-shadow: ${Shadows.SHADOW_M};
`;

export const InfoContainerReskin = styled.div`
  background-color: ${Colors.WHITE};
`;

export const InfoWrapper = styled.div`
  padding: 20px 16px 8px;
  ${mediaQuery.md`
    padding: 20px 32px 8px;
  `}
`;

export const InfoWrapperReskin = styled.div`
  padding: 16px 24px;
`;

export const Divider = styled.div`
  margin: 0 24px;
  border-bottom: 1px solid ${Colors.GRAY_3};
`;

export const Text = styled.p`
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: 0.34px;
  margin: 0;
  color: ${Colors.NEUTRAL_100};
  font-size: 17px;
  line-height: 24px;
`;

export const TextReskin = styled.p`
  font-family: ${Fonts.SIGN_PRIMARY};
  font-weight: 700;
  margin: 0;
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  font-size: 16px;
  line-height: 140%;
`;

export const TextUnitPrice = styled(Text)`
  color: ${Colors.PRIMARY_90};
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  margin: 8px 0;
  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
    margin-bottom: 16px;
  `}
`;

export const TextInfo = styled.p`
  font-size: 14px;
  line-height: 20px;
  margin-top: 8px;
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  b {
    font-weight: 600;
    color: ${Colors.NEUTRAL_100};
  }

  ${mediaQuery.md`
    margin-top: ${(props) => (props.secondary ? 8 : 16)}px;
  `}
`;

export const TextInfoReskin = styled.p`
  font-family: ${Fonts.SECONDARY};
  font-size: 14px;
  line-height: 140%;
  margin-top: 8px;
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  b {
    font-weight: 600;
    color: ${Colors.LUMIN_SIGN_PRIMARY};
  }

  ${mediaQuery.md`
    margin-top: ${(props) => (props.secondary ? 16 : 16)}px;
  `}
`;

export const TextBill = styled.p`
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
`;

export const TextTotal = styled.p`
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_90};

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const TextTotalReskin = styled.p`
  font-family: ${Fonts.SIGN_PRIMARY};
  font-size: 18px;
  line-height: 140%;
  font-weight: 500;
  color: ${Colors.NEUTRAL_80};

  span {
    color: ${Colors.LUMIN_SIGN_PRIMARY};
    font-size: 24px;
    font-weight: 700;
    line-height: 130%;
  }
`;

export const HorizontalBar = styled.hr`
  width: calc(100% - 20px - 32px);
  height: 0;
  display: block;
  border: none;
  outline: 0;
  border-top: 1px ${Colors.GRAY_2} dashed;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  margin: 0;
  transform: translateX(-50%);

  ${mediaQuery.md`
    width: calc(100% - 64px);
  `}
`;

export const Bill = styled.div`
  background-color: ${Colors.WHITE};
  box-shadow: ${Shadows.SHADOW_M};
  padding: 8px 16px 16px;
  ${mediaQuery.md`
    padding: 8px 32px 32px;
  `}
  border-bottom-left-radius: var(--border-radius-primary);
  border-bottom-right-radius: var(--border-radius-primary);
  position: relative;
  z-index: 1;
`;

export const BillReskin = styled.div`
  background-color: ${Colors.WHITE};
  padding: 16px 24px 24px 24px;
  position: relative;
  z-index: 1;
`;

export const MigrationDiscount = styled.div`
  margin-bottom: 16px;
  ${mediaQuery.md`
    margin-bottom: 16px;
  `}
  ${mediaQuery.xl`
    margin-bottom: 16px;
  `}
`;
export const BillRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  ${mediaQuery.md`
    margin-bottom: 16px;
  `}
`;

export const BillRowSecondary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const PurchaseWrapper = styled.div`
  margin-top: 16px;
  cursor: ${(props) => props.$disabled && 'not-allowed'};

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const Message = styled(MessageBox)`
  column-gap: 16px;
  margin-top: 16px;
  padding: 8px 16px;
  background-color: ${Colors.SECONDARY_10};

  span {
    color: ${Colors.NEUTRAL_80};
  }
`;
