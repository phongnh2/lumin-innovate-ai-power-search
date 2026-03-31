import uniq from 'lodash/uniq';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';
import core from 'core';

import { useTranslation } from 'hooks/useTranslation';

import { ModalTypes } from 'constants/lumin-common';

import { ScaleInfo } from '../interfaces';
import { measureToolActions, measureToolSelectors } from '../slices';
import { getScaleRatio } from '../utils';

export const useDeleteScale = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const scales = useSelector(measureToolSelectors.getScales);

  const renderMessage = (measurementsNum: number, pages: number[]) => {
    if (pages.length) {
      return (
        <div>
          <Trans
            i18nKey="viewer.measureTool.scaleInUseMessage"
            components={{ b: <b /> }}
            values={{
              pages: pages.join(', '),
              measurementsNum,
            }}
          />
          <br />
          <br />
          <Trans i18nKey="viewer.measureTool.deletionWarning" components={{ b: <b /> }} />
          <br />
          <br />
          <Trans i18nKey="viewer.measureTool.deleteConfirmation" />
        </div>
      );
    }

    return t('viewer.measureTool.deleteScaleConfirmation');
  };

  const deleteScale = (scaleInfo: ScaleInfo, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const coreScale = core.getScales();
    const scaleData = coreScale[scaleInfo.scale.toString()] || [];
    const annotations = scaleData.filter((item) => item instanceof window.Core.Annotations.Annotation);
    const measurementsNum = annotations.length;
    const pages = uniq(annotations.map((annotation) => annotation.PageNumber)).sort((a, b) => a - b);

    dispatch(
      actions.openModal({
        title: t('viewer.measureTool.deleteScaleTitle', {
          title: getScaleRatio(scaleInfo),
        }),
        type: ModalTypes.WARNING,
        message: renderMessage(measurementsNum, pages),
        confirmButtonTitle: t('common.confirm'),
        cancelButtonTitle: t('common.cancel'),
        onConfirm: () => {
          dispatch(measureToolActions.deleteScale(scaleInfo));
          dispatch(measureToolActions.setSelectedScale(scales[0]));
          core.deleteScale(scaleInfo.scale);
        },
        onCancel: () => {
          dispatch(actions.closeModal() as AnyAction);
        },
      })
    );
  };

  return { deleteScale };
};
