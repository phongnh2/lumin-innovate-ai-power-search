import styled from 'styled-components';
import { makeStyles } from '@mui/styles';
import { FormControlLabel as MaterialFormControlLabel } from '@mui/material';

import { Fonts, Colors } from 'constants/styles';
import ModalFooter from 'luminComponents/ModalFooter';
import { Checkbox } from 'lumin-components/Shared/Checkbox';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const useRadioGroupStyles = makeStyles({
  root: {
    overflowY: 'scroll',
    height: 236,
    display: 'block',
  },
});

export const ModalContainer = styled.div`
  padding: 0 0 8px;
  justify-content: center;
  ${mediaQuery.md`
    padding-bottom: 0;
  `}
`;

export const Title = styled.h1`
  padding: 16px 16px 0;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 8px;
  ${mediaQuery.md`
    margin-bottom: 16px;
    font-size: 20px;
    line-height: 28px;
    padding: 24px 24px 0;
  `}
`;

export const ModalFooterContainer = styled(ModalFooter)`
  margin: 0 16px 16px;
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  ${mediaQuery.md`
    flex-direction: row;
    margin: 0 24px 24px;
    button:first-child {
      max-width: 284px;
    }
  `}
`;

export const Divider = styled.div`
  height: 1px;
  margin: 4px 16px 8px;
  background: ${Colors.NEUTRAL_20};
  ${mediaQuery.md`
    margin: 0 24px 8px;
  `}
`;

export const WarningContainer = styled.div`
  border-radius: 8px;
  padding: 8px;
  background-color: ${Colors.PRIMARY_10};
  margin: 0 16px 16px;
  display: flex;
  ${mediaQuery.md`
    align-items: center;
    padding: 7px 7px 7px 16px;
    margin: 0 24px 16px;
    justify-content: space-between;
  `}
`;

export const WarningGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 22px;
`;

export const WaringText = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-right: 4px;

  ${mediaQuery.md`
    margin-right: 8px;
  `}
`;

export const FormControlLabel = styled(MaterialFormControlLabel)`
  display: flex;
  flex-direction: row-reverse;
  margin: 0 0 2px;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px;
  ${mediaQuery.md`
    padding: 4px 24px;
  `}
`;

export const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const Label = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-left: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 230px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    max-width: 500px;
  `}
`;

export const CheckboxCustom = styled(Checkbox)``;