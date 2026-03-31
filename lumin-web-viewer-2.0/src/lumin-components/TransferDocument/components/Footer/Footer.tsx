import { Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'luminComponents/ButtonMaterial';
import { useTransferDocumentContext } from 'luminComponents/TransferDocument/hooks';
import { DestinationLocation, ITransferDocumentContext } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useEnableWebReskin, useTranslation } from 'hooks';

import * as Styled from './Footer.styled';

const Footer = (): JSX.Element => {
  const { getter, setter, onSubmit }: ITransferDocumentContext = useTransferDocumentContext();
  const { t } = useTranslation();
  const { onClose } = setter;
  const {
    destination,
    context,
    isProcessing,
    selectedTarget,
    errorName,
    disableTarget,
    documents,
    personalData,
    isPersonalTargetSelected,
  } = getter;
  const { isOldProfessional } = personalData;
  const {
    belongsTo: { workspaceId },
  } = documents[0];
  const { isEnableReskin } = useEnableWebReskin();

  const fileAlreadyInThisPlace = useMemo(() => {
    const isBelongsToMyDocuments = !isOldProfessional || isPersonalTargetSelected !== Boolean(workspaceId);
    if (isBelongsToMyDocuments && disableTarget === personalData._id) {
      return (
        destination._id === personalData._id ||
        (destination._id === workspaceId && destination.type === DestinationLocation.PERSONAL)
      );
    }
    return destination._id === disableTarget && destination.type !== DestinationLocation.PERSONAL;
  }, [destination, disableTarget, isOldProfessional, isPersonalTargetSelected, personalData._id, workspaceId]);

  const alreadyExistTitle =
    documents.length > 1 ? t('modalMove.tooltipFilesAreAlreadyHere') : t('modalMove.tooltipFileIsAlreadyHere');

  const submit = (): Promise<void> | void => onSubmit({ target: selectedTarget });

  if (isEnableReskin) {
    return (
      <Styled.FooterContainerReskin>
        <Button size="lg" variant="outlined" onClick={onClose} disabled={isProcessing}>
          {t('modalMove.cancel')}
        </Button>
        <PlainTooltip content={fileAlreadyInThisPlace ? alreadyExistTitle : ''} position="top-end">
          <Button
            size="lg"
            variant="filled"
            onClick={submit}
            disabled={Boolean(errorName) || !destination._id || fileAlreadyInThisPlace}
            loading={isProcessing}
          >
            {t(context.submit)}
          </Button>
        </PlainTooltip>
      </Styled.FooterContainerReskin>
    );
  }

  return (
    <Styled.FooterContainer>
      <Styled.Button
        color={ButtonColor.TERTIARY}
        onClick={onClose}
        size={{ mobile: ButtonSize.SM, tablet: ButtonSize.MD }}
      >
        {t('modalMove.cancel')}
      </Styled.Button>
      <Styled.Button
        disabled={Boolean(errorName) || !destination._id}
        onClick={submit}
        loading={isProcessing}
        size={{ mobile: ButtonSize.SM, tablet: ButtonSize.MD }}
      >
        {t(context.submit)}
      </Styled.Button>
    </Styled.FooterContainer>
  );
};

export default Footer;
