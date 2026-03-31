import styled from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Fonts, Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const UpdateContainer = styled.div``;

export const Group = styled.div`
  &:first-child {
    ${mediaQuery.md`
      animation: none;
    `}
  }
`;

export const Title = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-right: 18px;
  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const Container = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 1fr) min-content;
  margin-top: 16px;
  gap: 16px;
`;

export const EmailOffline = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${Colors.NEUTRAL_80};
  line-height: 20px;
`;

export const SubTitle = styled.p`
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  font-weight: 375;
  font-family: ${Fonts.PRIMARY};
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const BoldText = styled.span`
  font-weight: bold;
`;

export const Status = styled.p`
  color: ${Colors.SECONDARY_50};
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  margin-top: 8px;
`;

export const Info = styled.span`
  text-decoration: underline;
  color: ${Colors.SECONDARY_50};
  cursor: pointer;
  font-weight: 600;
`;

export const Button = styled(ButtonMaterial)`
  margin-top: 16px;
  padding: 14px 33px;
`;

export const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 14px;
`;

export const Message = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  color: ${Colors.SUCCESS_50};
  font-weight: normal;
  margin-left: 12px;
  line-height: 20px;
`;

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};
  outline: none;
  margin: 24px 0;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${mediaQuery.md`
    max-width: ${(props) => props.$workspaceName ? '456px' : '100%'};
  `}
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const TooltipContent = styled.p`
  white-space: pre-wrap;
`;

export const Setting = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-decoration: underline;
  color: ${Colors.SECONDARY_50};
  cursor: pointer;
`;

export const WorkspaceNameContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  ${mediaQuery.md`
    flex-direction: row;
    align-items: center;
    margin-top: 16px;
  `}
`;

export const WorkspaceName = styled.div`
  border-radius: 8px;
  border: 1px solid ${Colors.NEUTRAL_30};
  background: ${Colors.NEUTRAL_10};
  padding: 14px 16px;
  color: ${Colors.NEUTRAL_60};
  width: 100%;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400px;

  ${mediaQuery.md`
    margin: 0 16px 0 0;
    max-width: 456px;
  `}
`;