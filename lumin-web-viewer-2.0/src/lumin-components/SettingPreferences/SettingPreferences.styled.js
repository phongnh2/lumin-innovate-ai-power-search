import styled from 'styled-components';
import { Checkbox } from 'lumin-components/Shared/Checkbox';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import ButtonMaterial from 'lumin-components/ButtonMaterial';

export const StyledWrapper = styled.div``;

export const StyledContainer = styled.div``;

export const StyledTitle = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const StyledGroup = styled.div`
  margin-top: 24px;
`;

export const StyledGroupTitle = styled.h4`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const StyledCheckboxWrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  margin-top: 18px;
`;

export const StyledCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledCheckbox = styled(Checkbox)`
  padding: 0;
`;

export const StyledCheckboxContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;

  ${mediaQuery.md`
    margin-left: 14px;
  `}
`;

export const StyledCheckboxContent = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};

  ${({ isMarketing }) => isMarketing && `
    font-weight: 600;
    color: ${Colors.NEUTRAL_100};
  `}

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const StyledCheckboxDescription = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 6px;

  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
    margin-top: 4px;
  `}
`;

export const StyledCheckboxNoti = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;

  ${mediaQuery.md`
    margin-top: 20px;
  `}

  p {
    font-family: ${Fonts.PRIMARY};
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    color: ${Colors.SUCCESS_50};
    margin-left: 10px;

    ${mediaQuery.md`
      font-size: 14px;
      line-height: 20px;
      margin-left: 14px;
    `}
  }
`;

export const StyledLink = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-decoration-line: underline;
  color: ${Colors.SECONDARY_50};
  margin-top: 12px;
  cursor: pointer;

  ${mediaQuery.md`
    margin-top: 16px;
  `}
`;

export const StyledDataWrapper = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${Colors.NEUTRAL_20};
`;

export const StyledDataContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
`;

export const StyledDataLabel = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const StyledDataDescription = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 4px;

  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
  `}
`;

export const StyledSwitchWrapper = styled.div`
  margin-left: 24px;
`;

export const StyledButtonWrapper = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${Colors.NEUTRAL_20};
`;

export const StyledButtonDelete = styled(ButtonMaterial)`
  &:hover {
    background-color: ${Colors.SECONDARY_50};
    color: white;
  }
`;
