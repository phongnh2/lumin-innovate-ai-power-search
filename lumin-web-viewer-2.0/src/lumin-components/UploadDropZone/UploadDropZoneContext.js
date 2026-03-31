import React from 'react';

const UploadDropZoneContext = React.createContext({
  showHighlight: false,
  highlight: false,
  isDragging: false,
  isDropOnFolder: false,
});
export { UploadDropZoneContext };
