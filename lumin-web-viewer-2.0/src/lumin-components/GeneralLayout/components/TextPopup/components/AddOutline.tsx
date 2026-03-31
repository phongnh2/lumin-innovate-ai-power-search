import React from 'react';
import { useSelector } from 'react-redux';

import IconButton from '@new-ui/general-components/IconButton';
import Tooltip from '@new-ui/general-components/Tooltip';
import { Quad } from 'core/type';

import core from 'core';
import selectors from 'selectors';

import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { useTranslation } from 'hooks/useTranslation';

import fireEvent from 'helpers/fireEvent';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { DataElements } from 'constants/dataElement';

interface AddOutlineProps {
  closePopup: () => void;
  annotation?: Core.Annotations.Annotation;
}

const AddOutline = ({ closePopup, annotation }: AddOutlineProps) => {
  const { t } = useTranslation();
  const isInFormFieldCreationMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();
  const isDefaultMode = useSelector(selectors.isDefaultMode);
  const { isOnline } = useNetworkStatus();

  const isRedactAnnotation = annotation && annotation instanceof window.Core.Annotations.RedactionAnnotation;
  const showAddOutlineButton = !isInFormFieldCreationMode && isDefaultMode && isOnline && !isRedactAnnotation;

  const getPageNumberFromQuads = (quads: Quad[]): number | null => {
    const pageNumberList = Object.keys(quads);
    return pageNumberList.length > 0 ? Number(pageNumberList[0]) : null;
  };

  const getPageNumberFromAnnots = (annots: Core.Annotations.Annotation[]): number | null => {
    if (annots.length !== 1) {
      return null;
    }
    return parseInt(String(annots[0].PageNumber), 10);
  };

  const getPageNumberFromUserSelection = () =>
    getPageNumberFromQuads(core.getSelectedTextQuads()) || getPageNumberFromAnnots(core.getSelectedAnnotations());

  const onClick = () => {
    closePopup();
    const pageNumber = getPageNumberFromUserSelection();
    fireEvent(CUSTOM_EVENT.OPEN_OUTLINE_PANEL, {
      pageNumber,
      textContent: core.getSelectedText(),
    });
  };

  if (!showAddOutlineButton) {
    return null;
  }
  return (
    <Tooltip title={t('outlines.actions.addTo')}>
      <IconButton
        icon="add-outline"
        iconSize={24}
        onClick={onClick}
        data-element={DataElements.ADD_OUTLINE_BUTTON}
        data-lumin-btn-name={ButtonName.ADD_OUTLINE}
        data-lumin-btn-purpose="Add outline by selecting text"
      />
    </Tooltip>
  );
};

export default AddOutline;
