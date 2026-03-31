import React from 'react';
import PropTypes from 'prop-types';
import DocumentItemPreview from './DocumentItemPreview';

const DocumentDragPreview = ({ document, countMoveFile }) => (
  <div
    key={document._id}
    className="card card-dragged"
    style={{
      zIndex: document.length,
    }}
  >
    <DocumentItemPreview document={document} countFileMove={countMoveFile} />
  </div>
);

DocumentDragPreview.propTypes = {
  document: PropTypes.object.isRequired,
  countMoveFile: PropTypes.number,
};
DocumentDragPreview.defaultProps = {
  countMoveFile: 1,
};

export default DocumentDragPreview;
