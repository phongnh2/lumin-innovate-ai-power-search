import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useTranslation } from 'hooks';

import { Colors } from 'constants/styles';

import { StyledButton, StyledTextButton } from './HeaderBarSection.styled';

function MoveDocumentsButton({ isDisabled, onMoveDocuments }) {
  const isOffline = useSelector(selectors.isOffline);
  const { t } = useTranslation();

  return (
    <Tooltip title={isDisabled && !isOffline && t('documentPage.adminCanPerform')} placement="top">
      <span>
        <StyledButton size={ButtonSize.XS} color={ButtonColor.TERTIARY} disabled={isDisabled} onClick={onMoveDocuments}>
          <Icomoon size={16} className="move-file" color={isDisabled ? Colors.NEUTRAL_40 : Colors.NEUTRAL_100} />
          <StyledTextButton>{t('common.move')}</StyledTextButton>
        </StyledButton>
      </span>
    </Tooltip>
  );
}

MoveDocumentsButton.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  onMoveDocuments: PropTypes.func.isRequired,
};

export default MoveDocumentsButton;
