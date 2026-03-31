import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Dialog from 'lumin-components/Dialog';
import Icomoon from 'lumin-components/Icomoon';
import { Checkbox } from 'lumin-components/Shared/Checkbox';

import { useDesktopMatch, useTranslation } from 'hooks';

import { LocalStorageKey } from 'constants/localStorageKey';
import { Colors } from 'constants/styles';
import { ModalSize } from 'constants/styles/Modal';

import WarningSaveLocalFileModalTheme from 'theme-providers/WarningSaveLocalFileModal.theme';

import * as Styled from './WarningSaveLocalFileModal.styled';

const modalStyles = makeStyles({
  paper: {
    padding: '32px 24px',
  },
});

const TYPE_SAVE_COMPARES = [
  {
    text: 'offlineAccess',
    highLightCheckbox: [true, true],
  },
  {
    text: 'collaborateWithOthers',
    highLightCheckbox: [false, true],
  },
  {
    text: 'publishInYourOrganization',
    highLightCheckbox: [false, true],
  },
];

const SAVED_MEMORIES = {
  TO_DEVICE: 'to_device',
  TO_CLOUD: 'to_cloud',
};

const WarningSaveLocalFileModal = ({
  saveFileToDevice,
  saveFileToCloud,
  onClose,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const isDesktop = useDesktopMatch();
  const modalClasses = modalStyles();
  const dialogWidth = isDesktop ? ModalSize.XL : ModalSize.LG;
  const { t } = useTranslation();
  const getTranslatedContent = (translateKey) => t(`viewer.saveLocalFileModal.${translateKey}`);

  const onSaveFileToDevice = async () => {
    if (isChecked) {
      localStorage.setItem(LocalStorageKey.SYSTEM_DEFAULT_SAVED, SAVED_MEMORIES.TO_DEVICE);
    }
    saveFileToDevice();
    onClose();
  };

  const onSaveFileToCloud = async () => {
    if (isChecked) {
      localStorage.setItem(LocalStorageKey.SYSTEM_DEFAULT_SAVED, SAVED_MEMORIES.TO_CLOUD);
    }
    saveFileToCloud();
    onClose();
  };

  const onCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  return (
    <Dialog
      open
      width={dialogWidth}
      classes={modalClasses}
    >
      <WarningSaveLocalFileModalTheme>
        <Styled.ModalTitle>{getTranslatedContent('title')}</Styled.ModalTitle>
        <Styled.Table>
          <Styled.HeaderTable>
            <Styled.HeaderElement />
            <Styled.HeaderElement>
              <Styled.ContainerTitle>
                <Icomoon className="computer" color={Colors.PRIMARY_90} size={22} />
                <Styled.Title>{t('viewer.onYourDevice')}</Styled.Title>
              </Styled.ContainerTitle>
            </Styled.HeaderElement>
            <Styled.HeaderElement>
              <Styled.ContainerTitle>
                <Icomoon className="cloud-check" color={Colors.PRIMARY_90} size={22} />
                <Styled.Title>{getTranslatedContent('luminCloud')}</Styled.Title>
              </Styled.ContainerTitle>
            </Styled.HeaderElement>
          </Styled.HeaderTable>
          <Styled.DataTable>
            {TYPE_SAVE_COMPARES.map((item, index) => (
              <Styled.DataRow key={index}>
                <Styled.DataRowItem>
                  <Styled.Text>{getTranslatedContent(item.text)}</Styled.Text>
                </Styled.DataRowItem>
                <Styled.DataRowItem>
                  <Styled.CheckBoxItem isActiveFeature={item.highLightCheckbox[0]}>
                    <Icomoon className="check" color="white" size={12} />
                  </Styled.CheckBoxItem>
                </Styled.DataRowItem>
                <Styled.DataRowItem>
                  <Styled.CheckBoxItem isActiveFeature={item.highLightCheckbox[1]}>
                    <Icomoon className="check" color="white" size={12} />
                  </Styled.CheckBoxItem>
                </Styled.DataRowItem>
              </Styled.DataRow>
            ))}
          </Styled.DataTable>
        </Styled.Table>
        <Styled.FooterContainer>
          <Styled.CheckboxContainer>
            <Checkbox checked={isChecked} onChange={onCheckboxChange} />
            <Styled.LabelCheckBox>{t('common.doNotShowAgain')}</Styled.LabelCheckBox>
          </Styled.CheckboxContainer>
          <Styled.ButtonContainer>
            <Styled.ButtonSaveComputer
              size={ButtonSize.XL}
              color={ButtonColor.SECONDARY_RED}
              onClick={onSaveFileToDevice}
            >
              {getTranslatedContent('saveOnComputer')}
            </Styled.ButtonSaveComputer>
            <ButtonMaterial
              color={ButtonColor.PRIMARY}
              size={ButtonSize.XL}
              onClick={onSaveFileToCloud}
            >
               {getTranslatedContent('saveToLuminCloud')}
            </ButtonMaterial>
          </Styled.ButtonContainer>
        </Styled.FooterContainer>
      </WarningSaveLocalFileModalTheme>
    </Dialog>
  );
};

WarningSaveLocalFileModal.propTypes = {
  saveFileToDevice: PropTypes.func,
  saveFileToCloud: PropTypes.func,
  onClose: PropTypes.func,
};

WarningSaveLocalFileModal.defaultProps = {
  saveFileToDevice: () => {},
  saveFileToCloud: () => {},
  onClose: () => {},
};

export default WarningSaveLocalFileModal;
