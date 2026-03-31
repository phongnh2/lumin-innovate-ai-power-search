import React from 'react';
import PropTypes from 'prop-types';
import { UploadDropZoneContext } from '.';

const propTypes = {
  children: PropTypes.node.isRequired,
  highlight: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
};

function DropZoneComponent({
  isDragging,
  highlight,
  children,
}) {
  return (
    <UploadDropZoneContext.Provider value={{
      showHighlight: isDragging && highlight,
      highlight,
      isDragging,
    }}
    >
      {children}
    </UploadDropZoneContext.Provider>
  );
}

DropZoneComponent.propTypes = propTypes;

export default React.memo(DropZoneComponent);
