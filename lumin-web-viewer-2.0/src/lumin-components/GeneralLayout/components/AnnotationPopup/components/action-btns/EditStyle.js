import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { isMeasurementExcludedCalibration } from 'features/MeasureTool/utils/isMeasurementAnnotation';

import { AnnotationSubjectMapping } from 'constants/documentConstants';

import { AnnotationPopupContext } from '../../AnnotationPopupContext';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

const getStyleButtonDataEvent = (annotation) => {
  if (annotation.Subject === AnnotationSubjectMapping.redact) {
    return {
      'data-lumin-btn-name': ButtonName.CHANGE_COLOUR_REDACTION,
    };
  }
  return {};
};

const EditStyle = ({ disabledElements }) => {
  const { setIsStylePopupOpen, annotation } = useContext(AnnotationPopupContext);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { showEditStyleButton } = useAnnotationPopupBtnCondition();

  const handleClickEditStyle = () => {
    if (disabledElements.annotationStyleEditButton) {
      return;
    }
    if (isMeasurementExcludedCalibration(annotation)) {
      dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value));
      dispatch(actions.setIsToolPropertiesOpen(true));
      dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.MEASURE));
      core.getAnnotationManager().selectAnnotation(annotation);
      return;
    }
    setIsStylePopupOpen(true);
  };

  return showEditStyleButton ? (
    <IconButton
      tooltipData={{ location: 'bottom', title: t('action.changeStyle') }}
      dataElement="annotationStyleEditButton"
      icon="md_style_palette"
      iconSize={24}
      onClick={handleClickEditStyle}
      {...getStyleButtonDataEvent(annotation)}
    />
  ) : null;
};

EditStyle.propTypes = {
  disabledElements: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  disabledElements: selectors.getDisabledElementFromList(state, ['annotationStyleEditButton']),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(EditStyle);
