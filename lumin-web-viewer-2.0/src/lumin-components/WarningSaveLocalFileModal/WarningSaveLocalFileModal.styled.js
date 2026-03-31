import styled from 'styled-components';
import { Fonts, Colors } from 'constants/styles';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const ModalTitle = styled.h2`
  text-align: center;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${({ theme }) => theme.warningSaveLocalFileModal.text};
  margin-bottom: 16px;
  ${mediaQuery.xl`
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const Table = styled.div`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.warningSaveLocalFileModal.border};
`;

export const HeaderTable = styled.div`
  border-bottom: 2px solid ${({ theme }) => theme.warningSaveLocalFileModal.borderBottom};
  background-color: ${Colors.PRIMARY_10};
  height: 72px;
  border-radius: 8px 8px 0 0;
  display: flex;
  & > div:last-child {
    border-right: none;
  }
`;

export const HeaderElement = styled.div`
  width: 35%;
  padding: 12px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid ${Colors.NEUTRAL_20};
`;

export const ContainerTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.p`
  margin-top: 8px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.PRIMARY_90};
`;

export const DataTable = styled.div`
  & > div:last-child {
    border-bottom: none;
  }
`;

export const DataRow = styled.div`
  height: 56px;
  display: flex;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
  & > div:last-child {
    border-right: none;
  }
`;

export const DataRowItem = styled.div`
  padding: 16px 0;
  margin: 0 0 0 24px;
  width: 35%;
  border-right: 1px solid ${Colors.NEUTRAL_20};
`;

export const CheckBoxItem = styled.div`
  height: 24px;
  width: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ isActiveFeature }) => (isActiveFeature ? Colors.SECONDARY_50 : Colors.NEUTRAL_60)};
  margin: 0 auto;
`;
export const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  ${mediaQuery.xl`
    margin-top: 24px;
  `}
`;

export const Text = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.warningSaveLocalFileModal.text};
  ${mediaQuery.xl`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const ButtonContainer = styled.div`

`;

export const ButtonSaveComputer = styled(ButtonMaterial)`
  margin-right: 16px;
`;

export const CheckboxContainer = styled.div``;

export const LabelCheckBox = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.warningSaveLocalFileModal.checkboxTitle};
`;
