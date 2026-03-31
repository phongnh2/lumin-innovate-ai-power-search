import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { LuminNoteFooterProps } from './types';

import * as Styled from './LuminNoteFooter.styled';

const LuminNoteFooter = ({
  onConfirm,
  onCancel,
  disabledConfirmButton,
  disabledCancelButton,
  isUpdateContent,
  confirmButtonWording,
}: LuminNoteFooterProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Styled.FooterContainer $isUpdateContent={isUpdateContent}>
      <Button disabled={disabledCancelButton} onClick={onCancel} variant="outlined">
        {t('action.cancel')}
      </Button>
      <Button disabled={disabledConfirmButton} onClick={onConfirm} variant="filled">
        {t(confirmButtonWording)}
      </Button>
    </Styled.FooterContainer>
  );
};

export default LuminNoteFooter;
