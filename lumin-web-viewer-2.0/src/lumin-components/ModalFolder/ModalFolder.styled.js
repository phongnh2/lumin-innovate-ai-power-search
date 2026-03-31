import styled from 'styled-components';

import CustomCheckbox from 'lumin-components/CustomCheckbox';
import { Fonts, Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { FormControlLabel } from '@mui/material';

export const Title = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 16px;

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
    margin-bottom: 24px;
  `}
`;

export const InputWrapper = styled.div`
  margin-bottom: 16px;
`;

export const ColorWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const Label = styled.label`
  display: block;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const ColorItem = styled.span`
  display: block;
  border-radius: 8px;
  position: relative;
  width: calc(100% / 6 - 12px);
  height: 0;
  padding-bottom: calc(100% / 6 - 12px);
  margin: 6px;
  cursor: pointer;
  background-color: ${(props) => props.color};

  [class^="icon"] {
    color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  ${mediaQuery.md`
    width: calc(100% / 8 - 12px);
    padding-bottom: calc(100% / 8 - 12px);
  `}
`;

export const Footer = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${Colors.NEUTRAL_20};
`;

export const InfoContainer = styled.div`
`;

export const InfoDivider = styled.div`
  width: 100%;
  margin: 12px 0;
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};

  ${mediaQuery.md`
    margin: 16px 0;
  `}
`;

export const InfoDialogTitle = styled.div`
  text-align: center;
  padding-bottom: 16px;

  ${mediaQuery.md`
    padding-bottom: 24px;
  `};
`;

export const InfoRow = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  margin-bottom: 8px;
`;

export const InfoRowContent = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-left: 0;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;

  ${mediaQuery.md`
    margin-left: 10px;
    font-size: 14px;
    line-height: 20px;
  `};
`;

export const InfoTitle = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `};
`;

export const InfoRowTitle = styled.span`
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

export const InfoButtonWrapper = styled.div`
  width: 100%;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid ${Colors.NEUTRAL_20};

  ${mediaQuery.md`
    margin-top: 16px;
    padding-top: 32px;
  `}
`;

export const InfoLoading = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  min-height: 320px;
`;

export const CheckBoxWrapper = styled(FormControlLabel)`
  margin: 16px 0 0;
  ${mediaQuery.md`
    margin-top: 20px;
  `};
`;
export const NotifyText = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `};
`;

export const CheckBox = styled(CustomCheckbox)`
  padding: 0;
  margin-right: 12px;
`;
