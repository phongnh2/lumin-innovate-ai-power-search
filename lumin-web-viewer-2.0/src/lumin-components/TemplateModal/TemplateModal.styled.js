import styled from 'styled-components';

import ModalFooter from 'lumin-components/ModalFooter';
import Dialog from 'lumin-components/Dialog';
import { Checkbox as SharedCheckbox } from 'lumin-components/Shared/Checkbox';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
  wrapper: ({ destinationDisabled }) => ({
    '&&': {
      ...!destinationDisabled && {
        backgroundColor: 'white',
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: Colors.NEUTRAL_5,
        },
      },
    },
  }),
});

export const ModalContainer = styled(Dialog)``;

export const Title = styled.h2`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 16px;
  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const UploadContainer = styled.div`
  margin: 12px 0 16px;
`;

export const InputContainer = styled.div`
  margin-bottom: 16px;
`;

export const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const LabelInput = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-right: 8px;
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-bottom: 8px;
  ${mediaQuery.md`
    margin-bottom: 12px;
  `}
`;

export const ButtonGroup = styled(ModalFooter)`
  padding-top: 16px;
  border-top: 1px solid ${Colors.NEUTRAL_20};
`;

export const ThumbnailUploadContainer = styled.div`
  .MaterialAvatar__border {
    border-color: ${Colors.NEUTRAL_20};
  }
`;

export const BottomText = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${({ $disabled }) => ($disabled ? Colors.NEUTRAL_60 : Colors.NEUTRAL_80)};
`;

export const ThirdPartyNote = styled(BottomText)`
  margin-bottom: 16px;
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  margin: 16px 0;
  ${mediaQuery.md`
    margin: 18px 0;
  `};
`;

export const Checkbox = styled(SharedCheckbox)`
  padding: 0;
  margin-right: 10px;
`;
