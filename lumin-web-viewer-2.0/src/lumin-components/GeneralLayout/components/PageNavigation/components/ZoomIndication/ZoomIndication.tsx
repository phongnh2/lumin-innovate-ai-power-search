import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { isIOS } from 'helpers/device';

import { eventTracking } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

import UserEventConstants from 'constants/eventConstants';
import { ZOOM_THRESHOLD } from 'constants/zoomFactors';

import useZoomDocument, { ZoomTypes } from '../../hook/useZoomDocument';
import { InputType } from '../InputButton';

import * as Styled from './ZoomIndication.styled';

const ZoomIndication = (): JSX.Element => {
  const zoomRatio = useSelector(selectors.getZoom);
  const isAiProcessing = useSelector(editorChatBotSelectors.getIsAiProcessing);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [inputZoomLevel, setInputZoomLevel] = useState<string>(`${zoomRatio * 100}%`);
  const { t } = useTranslation();

  const { getValidZoomLevel, onZoomByAction, getRatioFromZoomLevel, getZoomLevelFromRatio, currentZoomLevel } =
    useZoomDocument();

  const getZoomValueWithUnit = (zoomValue: number): string => `${zoomValue}%`;

  const onSubmit = (): void => {
    const validZoomLevel = getValidZoomLevel(inputZoomLevel);

    if (validZoomLevel !== Number(inputZoomLevel.split('%')[0])) {
      setInputZoomLevel(getZoomValueWithUnit(validZoomLevel));
    }
    core.setZoomLevel(getRatioFromZoomLevel(validZoomLevel));
    textInputRef.current?.blur();
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: ButtonName.CHANGE_ZOOM_NUMBER,
      elementPurpose: ButtonPurpose[ButtonName.CHANGE_ZOOM_NUMBER],
    }).catch(() => {});
  };

  const onBlur = (_e: React.FocusEvent<HTMLFormElement, Element>): void => {
    if (getZoomLevelFromRatio(zoomRatio) !== Number(inputZoomLevel.split('%')[0])) {
      onSubmit();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputZoomLevel(e.target.value.trim());
  };

  const onFocus = (): void => {
    if (!textInputRef.current) {
      return;
    }
    if (isIOS) {
      textInputRef.current.setSelectionRange(0, 9999);
    } else {
      textInputRef.current.select();
    }
  };

  useEffect(() => {
    setInputZoomLevel(getZoomValueWithUnit(currentZoomLevel));
  }, [currentZoomLevel]);

  return (
    <Styled.ZoomLevelWrapper data-cy="zoom_level_wrapper">
      <Styled.ZoomButton
        disabled={zoomRatio <= ZOOM_THRESHOLD.MIN / 100 || isAiProcessing}
        onClick={() => {
          onZoomByAction(ZoomTypes.ZOOM_OUT);
        }}
        icon="md_zoom_out"
        tooltipData={{ location: 'top', title: t('action.zoomOut') }}
        iconSize={20}
        data-lumin-btn-name={ButtonName.ZOOM_OUT}
      />
      <Styled.Input
        ref={textInputRef}
        defaultValue={zoomRatio}
        onChange={onChange}
        onSubmit={onSubmit}
        onFocus={onFocus}
        onBlur={onBlur}
        inputType={InputType.TEXT}
        value={inputZoomLevel}
        isDisabled={isAiProcessing}
        data-lumin-btn-name={ButtonName.CHANGE_ZOOM_NUMBER}
      />
      <Styled.ZoomButton
        disabled={zoomRatio >= ZOOM_THRESHOLD.MAX / 100 || isAiProcessing}
        onClick={() => {
          onZoomByAction(ZoomTypes.ZOOM_IN);
        }}
        icon="md_zoom_in"
        tooltipData={{ location: 'top', title: t('action.zoomIn') }}
        iconSize={20}
        data-lumin-btn-name={ButtonName.ZOOM_IN}
      />
    </Styled.ZoomLevelWrapper>
  );
};

export default ZoomIndication;
