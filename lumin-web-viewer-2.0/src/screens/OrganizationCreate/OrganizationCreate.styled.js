import styled from 'styled-components';
import { makeStyles } from '@mui/styles';
import { FormControlLabel } from '@mui/material';

import ButtonMaterial from 'luminComponents/ButtonMaterial';
import MemberItem from 'luminComponents/MemberItem';
import Radio from 'lumin-components/CustomRadio';
import Alert from 'lumin-components/Shared/Alert';

import BgMobile from 'assets/images/organization-create-mobile-bg.svg';
import { Colors, Fonts } from 'constants/styles';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { Breakpoints } from 'constants/styles/Breakpoints';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;

  * {
    box-sizing: border-box;
  }
`;

export const StyledContent = styled.div`
  height:100%;
  margin: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  background: url("${BgMobile}") center/cover no-repeat;
  ${mediaQuery.xl`
    display: grid;
    grid-template-columns: 33% 67%;
    background: none;
  `}

`;

export const StyledContentLeft = styled.div`
  display: none;
  ${mediaQuery.xl`
    display: block;
    position: relative;
    background-color: ${Colors.OTHER_1}
  `}
`;
export const StyledContentRight = styled.div`
  width: 100%;
  justify-content: center;
  margin: 0 auto;
  align-items: center;
  ${mediaQuery.md`
    padding-bottom: 32px;
  `}
`;

export const StyledImage = styled.img`
  width: 412px;
  height: 412px;
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  object-fit: cover;
  z-index: 1;
`;

export const StyledForm = styled.div`
  box-sizing: border-box;
  margin: 24px 16px 16px;
  padding: 24px 16px 16px;
  background: ${Colors.WHITE};
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius-primary);
  ${mediaQuery.md`
    padding: 32px;
    margin: 80px 0 20px;
  `}
  ${mediaQuery.xl`
    padding: 56px 0 0;
    margin: 0px auto;
    max-width: 456px;
    width: 60%;
  `}
`;

export const StyledFormTitle = styled.div`
  font-size: 24px;
  line-height: 1.5;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 8px;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 1.33;
    margin-bottom: 16px;
  `}
`;
export const StyledFormContent = styled.div``;

export const StyledFormFooter = styled.div`
  margin-top: 16px;
`;

export const StyledButton = styled(ButtonMaterial)`
  width: 100%;
`;

export const StyledItem = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: ${(props) => (props.itemUpload ? '16px' : '12px')};

  ${mediaQuery.md`
    margin-bottom: ${(props) => (props.itemUpload ? '24px' : '16px')};
  `}
`;

export const StyledItemLabelWrapper = styled.div`
  margin-bottom: 4px;
`;

export const StyledItemLabel = styled.span`
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: 0.34px;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const StyledInputLabel = styled.span`
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  font-size: 12px;
  margin-bottom: 4px;
  color: ${Colors.NEUTRAL_80};
  font-weight: 600;
  line-height: 16px;

`;

export const StyledItemLabelOptional = styled.span`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.34px;
  margin-left: 5px;
  color: ${Colors.SECONDARY};
`;

export const StyledItemContent = styled.div`
`;

export const StyledError = styled.p`
  ${(props) => props.countMembers && `
    margin-top: 4px;
    margin-bottom: 0;
  `}

  ${mediaQuery.md`
    ${(props) => props.countMembers && `
      margin-top: 8px;
    `}
  `}

`;

export const StyledScrollbarsWrapper = styled.div`
  border-top: 1px solid ${Colors.NEUTRAL_20};
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
  padding-top: 8px;
`;

export const StyledScrollItem = styled(MemberItem)`
  && {
    padding: 4px 0;

    ${mediaQuery.md`
      padding: 12px 0;
    `}
  }
`;

export const StyledScrollItemRight = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;

  ${({ $isAdmin }) => !$isAdmin && `
    cursor: pointer;
  `}
`;

export const StyledScrollItemText = styled.span`
  font-size: 12px;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.34px;
  text-align: right;

  ${mediaQuery.md`
    font-size: 14px;
  `}

  &.${ORGANIZATION_ROLES.ORGANIZATION_ADMIN} {
    color: ${Colors.SECONDARY_50};
  }

  &.${ORGANIZATION_ROLES.BILLING_MODERATOR} {
    color: ${Colors.NEUTRAL_100};
  }

  &.${ORGANIZATION_ROLES.MEMBER} {
    color: ${Colors.NEUTRAL_100};
  }
`;

export const StyledMemberStatus = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  letter-spacing: 0.34px;
  text-align: right;
  color: ${Colors.RED};
`;

export const StyledMemberStatusText = styled.span``;

export const StyledItemType = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 28px;
  ${mediaQuery.md`
    margin-bottom: 24px;
  `}
`;

export const StyledItemLabelTypeWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  ${mediaQuery.md`
    margin-bottom: 18px;
  `}
`;

export const StyledItemTooltip = styled.div`
  margin-left: 8px;
`;

export const StyledItemMarker = styled.ul`
  padding-left: 20px;
  list-style-type: disc;

  &>li::marker {
    font-size: 10px;
  }
`;

export const StyledWarning = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-weight: 400;
  line-height: 1.5;
  color: ${Colors.SECONDARY_50};
  margin-top: -4px;
  margin-bottom: 16px;
  font-size: 10px;
  ${mediaQuery.md`
    font-size: 12px;
    margin: 16px 0 0;
  `}
`;

export const useStyles = makeStyles({
  label: {
    fontFamily: Fonts.PRIMARY,
    fontStyle: 'normal',
    fontSize: 14,
    lineHeight: '20px',
    color: Colors.NEUTRAL_60,
    fontWeight: 600,
    [`@media (max-width:${Breakpoints.md - 1}px)`]: {
      fontSize: 12,
    },
  },
  disabled: {
    '&&': {
      color: Colors.NEUTRAL_60,
    },
  },
});

export const StyledRadioWrapper = styled(FormControlLabel)`
  margin: 0;

  && {
    ${({ $disabled }) => $disabled && `
      cursor: not-allowed;
    `}
  }

  &:not(:last-of-type) {
    margin-bottom: 12px;
  }
  ${mediaQuery.md`
    &:not(:last-of-type) {
      margin-bottom: 0;
    }
  `}
`;

export const StyledRadio = styled(Radio)`
  padding: 0;
  margin-right: 10px;
`;

export const StyledAlert = styled(Alert)`
  margin: 8px 0;
  ${mediaQuery.md`
    margin-top: 0;
  `}
`;

export const StyledFormDescription =  styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 375;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin: 0;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
    margin-bottom: 8px;
  `}
`;