import PropTypes from 'prop-types';
import React from 'react';

import LuminCommentBox from '@new-ui/components/LuminCommentBox';

import core from 'core';

interface IProps {
  annotation: Core.Annotations.StickyAnnotation;
  selectedCommentIds: Record<string, boolean>;
  onResize?: () => void;
}

export default function LuminCommentItem({ selectedCommentIds, annotation, onResize }: IProps) {
  return (
    <LuminCommentBox
      annotation={annotation}
      isCommentPanel
      onResize={onResize}
      isSelected={selectedCommentIds[annotation.Id] || false}
      isContentEditable={core.canModify(annotation)}
    />
  );
}

LuminCommentItem.propTypes = {
  annotation: PropTypes.object.isRequired,
  selectedCommentIds: PropTypes.object.isRequired,
  onResize: PropTypes.func,
};

LuminCommentItem.defaultProps = {
  onResize: () => {},
};
