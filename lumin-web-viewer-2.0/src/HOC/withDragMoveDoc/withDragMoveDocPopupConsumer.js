import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { DragMoveDocumentPopupContext } from './withDragMoveDocPopupProvider';

const withDragMoveDocPopupConsumer = (Component) => {
  const HOC = (props) => {
    const {
      name,
      countMoveFile,
      toggle,
      ...rest
    } = props;
    const { setName, setCountMoveFile, setToggle } = useContext(DragMoveDocumentPopupContext);
    const onDragMovingFile = (_name, _countMoveFile, _toggle) => {
      setName(_name);
      setCountMoveFile(_countMoveFile);
      setToggle(_toggle);
    };
    return (
      <Component
        {...rest}
        onDragMovingFile={onDragMovingFile}
      />
    );
  };
  HOC.propTypes = {
    name: PropTypes.string,
    countMoveFile: PropTypes.number,
    toggle: PropTypes.bool,
  };

  HOC.defaultProps = {
    name: '',
    countMoveFile: 0,
    toggle: false,
  };

  return HOC;
};

export default withDragMoveDocPopupConsumer;
