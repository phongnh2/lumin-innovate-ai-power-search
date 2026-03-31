import React from 'react';
import PropTypes from 'prop-types';

import Dialog from 'lumin-components/Dialog';
import SvgElement from 'luminComponents/SvgElement';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { ModalTypes } from 'constants/lumin-common';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { useTranslation } from 'hooks';
import { ModalSize } from 'constants/styles';

import * as Styled from './ConfirmDeleteAccountModal.styled';

ConfirmDeleteAccountModal.propTypes = {
  setDeletePassword: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
  isLoginExternal: PropTypes.bool,
  deletePassword: PropTypes.string,
};

ConfirmDeleteAccountModal.defaultProps = {
  onConfirm: () => {},
  onClose: () => {},
  isLoginExternal: false,
  deletePassword: '',
};

function ConfirmDeleteAccountModal(props) {
  const {
    setDeletePassword,
    onConfirm,
    onClose,
    isLoginExternal,
    deletePassword,
  } = props;
  const { t } = useTranslation();

  const renderContent = () => {
    if (isLoginExternal) {
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SvgElement content={`icon-${ModalTypes.WARNING}`} width={48} height={48} />
          </div>
          <Styled.Title>{t('settingGeneral.deactivateYourAccount')}</Styled.Title>
          <Styled.SubTitle>{t('settingGeneral.messageDeactivateYourAccount')}</Styled.SubTitle>
        </>
      );
    }
    return (
      <>
        <Styled.TitleContainer>
          <SvgElement content={`icon-${ModalTypes.WARNING}`} width={48} height={48} />
          <Styled.TitlePassword>{t('settingGeneral.deactivateYourAccount')}</Styled.TitlePassword>
        </Styled.TitleContainer>
        <Styled.SubTitlePassword>{t('settingGeneral.messageDeactivateYourAccount')}</Styled.SubTitlePassword>
        <Styled.InputWrapper>
          <Styled.SubTitlePassword>{t('settingGeneral.messageDeactivateYourAccount1')}</Styled.SubTitlePassword>
          <Styled.CustomInput
            icon="lock"
            type="password"
            placeholder={t('settingGeneral.yourPassword')}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            showPassword
          />
        </Styled.InputWrapper>
      </>
    );
  };
  return (
    <Dialog open width={ModalSize.SM} onClose={onClose}>
      {renderContent()}

      <Styled.ButtonWrapper>
        <ButtonMaterial color={ButtonColor.TERTIARY} size={ButtonSize.XL} onClick={onClose}>
          {t('common.cancel')}
        </ButtonMaterial>
        <ButtonMaterial size={ButtonSize.XL} onClick={onConfirm}>
          {t('common.deactivate')}
        </ButtonMaterial>
      </Styled.ButtonWrapper>
    </Dialog>
  );
}

export default ConfirmDeleteAccountModal;
