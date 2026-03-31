/* eslint-disable no-fallthrough */
import React from 'react';
import PropTypes from 'prop-types';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Dialog from 'lumin-components/Dialog';
import Icomoon from 'lumin-components/Icomoon';
import { Colors } from 'constants/styles';
import { useTranslation } from 'hooks';

import * as Styled from './OfflineUpdateModal.styled';

const propTypes = {
  onClose: PropTypes.func,
  onUpdate: PropTypes.func,
};

const defaultProps = {
  onClose: () => {},
  onUpdate: () => {},
};

function OfflineUpdateModal({
  onClose, onUpdate,
}) {
  const { t } = useTranslation();

  return (
    <Dialog
      open
      onClose={onClose}
    >
      <Styled.Title>{t('settingGeneral.newUpdatesAreAvailable')}</Styled.Title>
      <Styled.SubTitle>
        {t('settingGeneral.newVersionIs')}
        <Styled.BoldText>{process.env.VERSION.split('-')[1]}</Styled.BoldText>
      </Styled.SubTitle>
      <Styled.ItemWrapper>
        <Styled.ItemContainer>{t('settingGeneral.offlineAccess')}</Styled.ItemContainer>
        <Styled.ItemContainer>{t('settingGeneral.othersUpdates')}</Styled.ItemContainer>
      </Styled.ItemWrapper>
      <Styled.MessageWrapper>
        <Icomoon className="info" color={Colors.SUCCESS_50} size={18} />
        <Styled.Message>{t('settingGeneral.updateNewVersion')}</Styled.Message>
      </Styled.MessageWrapper>
      <Styled.ButtonGroup>
        <Styled.Button
          color={ButtonColor.SECONDARY}
          size={ButtonSize.XL}
          onClick={onClose}
        >
          {t('common.later')}
        </Styled.Button>
        <Styled.Button
          size={ButtonSize.XL}
          onClick={onUpdate}
          $confirmBtn
        >
          {t('settingGeneral.updateNow')}
        </Styled.Button>
      </Styled.ButtonGroup>
    </Dialog>

  );
}

OfflineUpdateModal.propTypes = propTypes;
OfflineUpdateModal.defaultProps = defaultProps;

export default OfflineUpdateModal;
