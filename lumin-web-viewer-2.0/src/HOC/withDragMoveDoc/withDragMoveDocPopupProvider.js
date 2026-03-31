import React, { useState } from 'react';
import TopPopup from 'lumin-components/TopPopup';

export const DragMoveDocumentPopupContext = React.createContext({
  setName: () => { },
  setCountMoveFile: () => { },
  setToggle: () => { },
});

const withDragMoveDocumentPopup = (Component) => (props) => {
  const [name, setName] = useState(null);
  const [countMoveFile, setCountMoveFile] = useState(0);
  const [toggle, setToggle] = useState(false);
  const contextValue = {
    setName,
    setCountMoveFile,
    setToggle,
  };
  return (
    <DragMoveDocumentPopupContext.Provider value={contextValue}>
      <Component {...props} />
      <TopPopup.DragMoveDocument name={name} countMoveDocument={countMoveFile} toggle={toggle} />
    </DragMoveDocumentPopupContext.Provider>
  );
};

export default withDragMoveDocumentPopup;
