import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import PopperLimitWrapper from 'lumin-components/PopperLimitWrapper';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import useApplyOcrTool from 'features/DocumentOCR/useApplyOcrTool';

import { documentStorage } from 'constants/documentConstants';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import toolsName from 'constants/toolsName';

import { IDocumentBase } from 'interfaces/document/document.interface';

import './EditPanelOCR.scss';

const EditPanelOCR = (): JSX.Element => {
  const { t } = useTranslation();
  const currentDocument = useSelector<unknown, IDocumentBase>(selectors.getCurrentDocument, shallowEqual);
  const isOffline = useSelector<unknown, boolean>(selectors.isOffline);
  const isValidStorage = [documentStorage.s3, documentStorage.caching, documentStorage.google].includes(currentDocument.service);
  const disabled = !isValidStorage || isOffline;
  const applyOCR = useApplyOcrTool();
  return (
    <div className="EditPanelOCR">
      <PopperLimitWrapper
        onClick={applyOCR}
        toolName={toolsName.OCR as string}
        disabled={disabled}
        eventName={PremiumToolsPopOverEvent.OCR}
      >
        <ButtonMaterial className="EditPanelOCR__btn" data-lumin-btn-name={ButtonName.PERFORM_OCR} disabled={disabled}>
          {t('viewer.ocr.actionButton')}
        </ButtonMaterial>
      </PopperLimitWrapper>
    </div>
  );
};

export default EditPanelOCR;
