import { FormControlLabel as MaterialFormControlLabel } from '@mui/material';
import { Text } from 'lumin-ui/kiwi-ui';
import styled from 'styled-components';

import CustomCheckbox from 'lumin-components/CustomCheckbox/CustomCheckbox';
import Alert from 'luminComponents/Shared/Alert';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

interface BodyProps {
  $increaseHeight: number;
}

export const TransferDocumentBodyContainer = styled.div<BodyProps>`
  height: ${(props) => props.$increaseHeight ? '512px' : '432px'};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

export const TransferDocumentBodyContainerReskin = styled.div`
  height: 432px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: var(--kiwi-colors-surface-surface-container-low);
  color: var(--kiwi-colors-surface-on-surface);
  &[data-increase-height='true'] {
    height: calc(432px + 30px);
  }
`;

export const SideBarContainer = styled.div<{$isShowNotify: boolean}>`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: auto;
  ${mediaQuery.md<{$isShowNotify: boolean}>`
    padding: ${(props) => (props.$isShowNotify ? '12px 24px 0 24px' : '12px 24px')};
  `}
`;

export const SideBarContainerReskin = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 100%;
  overflow: auto;
  padding: var(--kiwi-spacing-1-5) var(--kiwi-spacing-3);
`;

export const ErrorMessage = styled(Alert)`
  margin: 8px 16px 0px;
  ${mediaQuery.md`
    margin: 8px 24px 0px;
  `}
`;

export const ErrorReskin = styled.div`
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-3) 0;
`;

export const FormControl = styled.div`
  margin: 12px 16px 0px;
  .FormControl__InputLabel {
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
  }
  ${mediaQuery.md`
    margin: 8px 24px 0px;
  `}
`;

export const FormControlReskin = styled.div`
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-3) 0;
`;

export const Label = styled(Text)`
  height: var(--kiwi-spacing-3);
  display: flex;
  align-items: center;
  padding-bottom: var(--kiwi-spacing-0-5);
`;

export const SelectText = styled(Text)`
  padding: var(--kiwi-spacing-1-5) var(--kiwi-spacing-3) 0;
`;

export const NotifyWrapper = styled.div`
  margin: 12px 16px;
  height: 48px;
  background-color: ${Colors.PRIMARY_10};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--border-radius-primary);
  ${mediaQuery.md`
    margin: 8px 24px;
  `}
`;

export const NotifyWrapperReskin = styled.div`
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-3);
  display: flex;
  align-items: center;
  gap: var(--kiwi-spacing-1);
`;

export const CheckBoxWrapper = styled.div`
  display: flex;
  height: var(--kiwi-spacing-2-5);
  width: var(--kiwi-spacing-2-5);
  align-items: center;
  justify-content: center;
`;

export const Bold = styled.span`
  font-weight: 700;
`;

export const Notify = styled.p`
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-ignore */
export const CheckBox = styled(CustomCheckbox)`
  padding: 0px;
`;

export const FormControlLabel = styled(MaterialFormControlLabel)`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 14px 0 16px;
`;
