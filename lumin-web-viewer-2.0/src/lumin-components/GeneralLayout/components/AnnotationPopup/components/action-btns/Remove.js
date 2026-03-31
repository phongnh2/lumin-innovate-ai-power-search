import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';

import actions from 'actions';
import core from 'core';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { AnnotationSubjectMapping } from 'constants/documentConstants';

import { AnnotationPopupContext } from '../../AnnotationPopupContext';

const getDeleteButtonEventData = (annotation) => {
  if (annotation.Subject === AnnotationSubjectMapping.redact) {
    return {
      'data-lumin-btn-name': ButtonName.DELETE_REDACTION,
    };
  }
  if (annotation.isContentEditPlaceholder()) {
    return annotation.getContentEditType() === window.Core.ContentEdit.Types.TEXT
      ? {
          'data-lumin-btn-name': ButtonName.DELETE_TEXTBLOCK,
        }
      : {
          'data-lumin-btn-name': ButtonName.DELETE_PDF_IMAGE,
        };
  }
  return {};
};

const Remove = ({ closeElement }) => {
  const { annotation, canModify } = useContext(AnnotationPopupContext);
  const { t } = useTranslation();
  return canModify ? (
    <IconButton
      dataElement="annotationDeleteButton"
      icon="md_trash"
      iconSize={24}
      tooltipData={{ location: 'bottom', title: t('action.delete') }}
      onClick={() => {
        core.deleteAnnotations(core.getSelectedAnnotations(), {});
        closeElement('annotationPopup');
      }}
      {...getDeleteButtonEventData(annotation)}
    />
  ) : null;
};

Remove.propTypes = {
  closeElement: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  closeElement: (args) => dispatch(actions.closeElement(args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Remove);
