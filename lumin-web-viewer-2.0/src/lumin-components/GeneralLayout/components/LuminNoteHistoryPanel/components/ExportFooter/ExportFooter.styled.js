import { Button as KiwiButton } from 'lumin-ui/kiwi-ui';
import styled from 'styled-components';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { ZIndex } from 'constants/styles';
import { typographies, spacings } from 'constants/styles/editor';

export const FooterContainer = styled.div`
  z-index: ${ZIndex.LUMIN_RIGHT_PANEL};
  position: absolute;
  padding: ${spacings.le_gap_1_25}px ${spacings.le_gap_1_5}px;
  width: 100%;
  border-radius: 0 0 16px 16px;
  left: 0;
  bottom: -100%;
  transition: all 275ms cubic-bezier(0, 0, 0.2, 1) 0.5ms;

  ${({ theme }) => `
    background-color: ${theme.le_main_surface_container};
    border-top: 1px solid ${theme.le_main_outline_variant};
  `}

  ${({ isShowed }) => isShowed && `
    bottom: 0px;
  `}
`;

export const FooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const ClosePanelButton = styled(IconButton)`
  width: 32px;
  height: 32px;
  min-width: 32px;
  margin-right: ${spacings.le_gap_0_5}px;
  ${({ disabled }) => `
    opacity: ${disabled ? '0.2' : '1'};
  `}

  i {
    color: ${({ theme }) => theme.le_main_on_surface_variant};
    font-size: 24px;
  }
`;

export const DescriptionContainer = styled.div`
  display: flex;
`;

export const Description = styled.span`
  min-width: 71px;
  padding-top: ${spacings.le_gap_1}px;
  margin-right: ${spacings.le_gap_0_5}px;
  ${({ ...typographies.le_label_medium })}

  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant}
  `}
`;

const BaseButton = styled(KiwiButton)`
  min-width: 68px;
  height: 32px;
  padding: ${spacings.le_gap_1}px;
  ${({ ...typographies.le_label_medium })}
`;

export const SelectButton = styled(BaseButton)`
  color: ${({ theme }) => theme.le_main_primary};
  background-color: transparent;
`;

export const ExportButton = styled(BaseButton)`
  border-radius: 8px;
  ${({ theme }) => `
    color: ${theme.le_main_on_primary};
    background-color:  ${theme.le_main_primary};
  `}
`;
