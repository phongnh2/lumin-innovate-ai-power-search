import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import * as Styled from './ButtonMore.styled';

function ButtonMore({
  contentPopper,
  isDisabled,
  popperPlacement,
  onMouseEnter,
  iconProps,
  onOpen,
  onClose,
  hoverColor,
  className,
  ...otherProps
}) {
  return (
    <Styled.Button>
      <Styled.CustomPopperButton
        $hoverColor={hoverColor}
        className={className}
        disabled={isDisabled}
        renderPopperContent={contentPopper}
        popperProps={{
          parentOverflow: 'scrollParent',
          disablePortal: false,
          placement: popperPlacement,
          scrollWillClosePopper: true,
        }}
        onMouseEnter={onMouseEnter}
        onOpen={onOpen}
        onClose={onClose}
        buttonProps={otherProps}
      >
        <Icomoon className="more-v" size={14} {...iconProps} />
      </Styled.CustomPopperButton>
    </Styled.Button>
  );
}

ButtonMore.propTypes = {
  contentPopper: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  popperPlacement: PropTypes.string,
  iconProps: PropTypes.object,
  onMouseEnter: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  hoverColor: PropTypes.string,
  className: PropTypes.string,
};

ButtonMore.defaultProps = {
  isDisabled: false,
  popperPlacement: 'bottom-end',
  iconProps: {},
  onMouseEnter: () => {},
  onOpen: () => {},
  onClose: () => {},
  hoverColor: '',
  className: '',
};

export default ButtonMore;
