import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Icomoon from 'lumin-components/Icomoon';
import MaterialPopper from 'lumin-components/MaterialPopper';
import { Colors } from 'constants/styles';

import * as Styled from './DropdownControl.styled';

function DropdownControl({
  value,
  onClick,
  children,
  inputProps,
  onClosed,
}) {
  const [popperShow, setPopperShow] = useState(false);
  const [maxPopperHeight, setMaxPopperHeight] = useState(0);
  const inputRef = useRef(null);
  const classes = Styled.useStyles();

  const handleClosePopper = () => {
    setPopperShow(false);
  };

  const handleClickInput = () => {
    setPopperShow(true);
    onClick();
  };

  const onClosePopper = () => {
    setPopperShow(false);
  };

  const updateMaxPopperHeight = () => {
    if (inputRef?.current) {
      const { top, height } = inputRef.current.getBoundingClientRect();
      const maxHeight = window.innerHeight - (top + height);
      setMaxPopperHeight(maxHeight);
    }
  };

  useEffect(() => {
    updateMaxPopperHeight();
  }, [popperShow]);

  return (
    <div>
      <Styled.Input
        {...inputProps}
        postfix={(
          <Styled.DropdownIcon>
            <Icomoon className="dropdown" size={16} color={Colors.SECONDARY} />
          </Styled.DropdownIcon>
        )}
        value={value}
        onClick={handleClickInput}
        readOnly
        ref={inputRef}
      />

      <MaterialPopper
        open={popperShow}
        anchorEl={inputRef?.current}
        placement="bottom-end"
        handleClose={onClosePopper}
        onExited={onClosed}
        parentOverflow="viewport"
        disablePortal
        classes={classes.popper}
        style={{ width: `${inputRef?.current ? inputRef.current.offsetWidth : 320}px` }}
      >
        {children({ closePopper: handleClosePopper, maxPopperHeight })}
      </MaterialPopper>
    </div>
  );
}

DropdownControl.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.func.isRequired,
  inputProps: PropTypes.object,
  onClosed: PropTypes.func,
};

DropdownControl.defaultProps = {
  value: '',
  inputProps: {},
  onClick: () => {},
  onClosed: () => {},
};

export default DropdownControl;
