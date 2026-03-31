import PropTypes from 'prop-types';
import React from 'react';

import * as DocumentItemStyled from '../../DocumentItem.styled';

function DocumentActionButton({
  disabled,
  className,
  children,
}) {
  const onClick = (e) => {
    disabled && e.stopPropagation();
  };
  return (
    <DocumentItemStyled.ButtonMore
      onClick={onClick}
      className={className}
      $disabled={disabled}
    >
      {children}
    </DocumentItemStyled.ButtonMore>
  );
}

DocumentActionButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
DocumentActionButton.defaultProps = {
  className: '',
};

export default DocumentActionButton;
