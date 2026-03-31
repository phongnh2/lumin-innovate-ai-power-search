/* eslint-disable arrow-body-style */
import PropTypes from 'prop-types';
import React from 'react';
import Draggable from 'react-draggable';

import * as Styled from './DraggablePopup.styled';

const DraggablePopup = React.forwardRef(
  ({ children, position, open, dataElement, handle, cancel, wrapperProps, allowDrag }, ref) => {
    return (
      <Draggable handle={handle} cancel={cancel} disabled={!allowDrag}>
        <Styled.AnnotationPopupWrapper
          $open={open}
          $allowDrag={allowDrag}
          ref={ref}
          data-element={dataElement}
          style={{ ...position }}
          {...wrapperProps}
        >
          {children}
        </Styled.AnnotationPopupWrapper>
      </Draggable>
    );
  }
);

DraggablePopup.propTypes = {
  children: PropTypes.any.isRequired,
  position: PropTypes.object.isRequired,
  open: PropTypes.bool,
  dataElement: PropTypes.string,
  handle: PropTypes.string,
  cancel: PropTypes.string,
  wrapperProps: PropTypes.object,
  allowDrag: PropTypes.oneOf(['top', 'left', null]),
};

DraggablePopup.defaultProps = {
  open: false,
  dataElement: '',
  handle: '',
  cancel: '',
  wrapperProps: {},
  allowDrag: 'left',
};

export default DraggablePopup;
