import styled from 'styled-components';
import Dialog from 'luminComponents/Dialog';
import ModalFooter from 'luminComponents/ModalFooter';
import Input from 'luminComponents/Shared/Input';
import Alert from 'luminComponents/Shared/Alert';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledDialog = styled(Dialog)`
  * {
    box-sizing: border-box;
  }
`;

export const StyledDialogContainer = styled.div`

`;

export const StyledDialogTitle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
  padding-bottom: 16px;
`;

export const StyledDialogContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const StyledDialogError = styled(Alert)`
  margin-bottom: 12px;
`;

export const StyledDialogFooter = styled(ModalFooter)`
  margin-top: 16px;
`;

export const StyledContentItem = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const StyledLabelWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

export const StyledLabel = styled.span`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-bottom: 8px;
  ${mediaQuery.md`
    margin-bottom: 12px;
  `}
`;

export const StyledAvatarUploadContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${(props) => (props.teamNameEmpty && `
    .MaterialAvatar__container {
      background: unset;
    }
  `)}
`;

export const StyledInput = styled(Input)`
  margin-top: 8px;
`;

export const StyledDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};
`;
