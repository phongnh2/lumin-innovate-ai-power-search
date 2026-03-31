import styled from 'styled-components';
import { Colors, Fonts, Shadows } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import MessageBox from 'luminComponents/Shared/MessageBox';

export const Card = styled.div`
  box-shadow: ${Shadows.SHADOW_M};
  background: white;
  border: 1px solid ${Colors.NEUTRAL_30};
  border-radius: var(--border-radius-primary);
`;

export const CardReskin = styled.div`
  height: fit-content;
  box-shadow: ${Shadows.SHADOW_LIGHT_DIALOG_RESKIN};
  background: white;
  border-radius: 12px;
  overflow: hidden;
`;

export const OrgInfoCard = styled.div`
  .OrganizationInfo__item {
    color: ${Colors.NEUTRAL_80};
  }
  .OrganizationInfo__input .MaterialSelect__value {
    color: ${Colors.NEUTRAL_100};
  }
`;

export const OrgInfoCardReskin = styled.div`
  .OrganizationInfo__container {
    height: 40px;
    margin-bottom: 8px;
    border: 1px solid ${Colors.GRAY_3};

    .icon-arrow-up {
      transform: rotate(-180deg);
    }
  }
  .MaterialSelect--focus.OrganizationInfo__container {
    border: 1px solid var(--color-primary-50);
  }
  .OrganizationInfo__item {
    color: ${Colors.NEUTRAL_80};
  }
  .OrganizationInfo__input .MaterialSelect__value {
    font-family: ${Fonts.SECONDARY};
    font-size: 14px;
    font-weight: 500;
    line-height: 140%;
    color: ${Colors.LUMIN_SIGN_PRIMARY};
  }
`;


export const CardTop = styled.div`
  padding: 16px 0 0 16px;
  display: flex;
  align-items: center;
  ${mediaQuery.md`
    height: 64px;
    padding: 24px 0 0 32px;
  `}
`;

export const CardTopReskin = styled.div`
  padding: 16px 0 0 16px;
  ${mediaQuery.md`
    padding: 16px 24px 0 24px;
  `}
`;

export const CardTopContainer = styled.div`
  border-top-left-radius: var(--border-radius-primary);
  border-top-right-radius: var(--border-radius-primary);
`;

export const CardTopContainerReskin = styled.div``;

export const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
`;

export const CardTitleReskin = styled.h2`
  font-family: ${Fonts.SECONDARY};
  font-size: 18px;
  font-weight: 500;
  line-height: 140%;
  color: ${Colors.LUMIN_SIGN_PRIMARY};
`;

export const CardBody = styled.div`
  padding: 12px 16px;
  ${mediaQuery.md`
    padding: 12px 32px 32px;
  `}
`;

export const CardBodyReskin = styled.div`
  padding: 12px 16px;
  ${mediaQuery.md`
    padding: 16px 24px 0;
  `}
`;

export const OrgDropdownWrapper = styled.div`
  padding: 12px 16px 0;
  ${mediaQuery.md`
    padding: 12px 32px 0;
  `}
`;

export const OrgDropdownWrapperReskin = styled.div`
  padding: 12px 16px 0;
  ${mediaQuery.md`
    padding: 8px 24px 0;
  `}
`;

export const InputWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  ${({ $showQuantity }) =>
    $showQuantity &&
    mediaQuery.md`
      grid-template-columns: 1fr 180px;
      gap: 16px;
  `}
`;

export const InputNumberWrapper = styled.div`
  margin-top: 16px;
  ${mediaQuery.md`
    margin-top: 0;
  `}
`;

export const EmptyMessage = styled.p`
  white-space: pre-wrap;
  a {
    color: ${Colors.DARK_SKY_BLUE};
    font-weight: 600;
    text-decoration: underline;
  }
`;
export const MessageContainer = styled.div`
  margin-top: 16px;
`;

export const OrgInfoMessage = styled(MessageBox)`
  padding: 8px 8px 8px 16px;
  column-gap: 16px;
  a {
    color: ${Colors.SECONDARY_50};
  }
  ${mediaQuery.md`
    padding: 8px 16px 8px 20px;
  `}
`;

export const SelectOrgContainer = styled.div`
  padding: 12px 16px 0;
  ${mediaQuery.sm`
    padding: 12px 32px 0;
  `}
`;
