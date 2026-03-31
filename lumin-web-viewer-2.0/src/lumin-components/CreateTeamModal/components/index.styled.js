import styled from 'styled-components';
import { Colors } from 'constants/styles/Colors';
import { Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import Icomoon from 'luminComponents/Icomoon';

export const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  height: 40px;
  float: right;
  cursor: pointer;
`;

export const StyledDropDown = styled(Icomoon)`
  color: ${Colors.SECONDARY};
  pointer-events: none;
  line-height: 12px;
  margin-left: 4px;
`;

export const RoleWrapper = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-size: 12px;
  font-weight: 400;
  line-height: 10px;
  letter-spacing: normal;
  color: ${Colors.NEUTRAL_50};

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.34px;
  `}

  &.member {
    color: ${Colors.SECONDARY};

    ${mediaQuery.md`
      font-weight: 600;
    `}
  }

  &.selected {
    color: ${Colors.PRIMARY};
  }

  &.owner {
    color: ${Colors.ACCENT};
  }

  &.moderator,
  &.teamAdmin {
    color: ${Colors.NEUTRAL_50};
  }
`;
