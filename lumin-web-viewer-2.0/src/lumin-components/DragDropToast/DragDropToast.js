import React from 'react';
import Icomoon from 'luminComponents/Icomoon';

import './DragDropToast.scss';

const DragDropToast = () => {
  return (
    <div className="DragDropToastOverlay">
      <div className="DragDropToast">
        <Icomoon className="upload-drag-drop icon__18 icon" />
        <span>Drag and drop to instantly upload</span>
      </div>
    </div>
  );
};

export default DragDropToast;
