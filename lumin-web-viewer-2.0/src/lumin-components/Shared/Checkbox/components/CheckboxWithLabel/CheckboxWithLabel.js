import React from 'react';
import PropTypes from 'prop-types';

import * as Styled from './CheckboxWithLabel.styled';

function CheckboxWithLabel({
  text,
  checked,
  disabled,
  onChange,
  style,
}) {
  const onCheckboxChange = () => {
    if (disabled) {
      return;
    }
    onChange(!checked);
  };
  return (
    <Styled.CheckboxContainer style={style} disabled={disabled} onClick={onCheckboxChange}>
      <Styled.Text>{text}</Styled.Text>
      <Styled.CheckboxCustom checked={checked} disabled={disabled} />
    </Styled.CheckboxContainer>
  );
}

CheckboxWithLabel.propTypes = {
  style: PropTypes.object,
  text: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

CheckboxWithLabel.defaultProps = {
  style: {},
  disabled: false,
};

export default CheckboxWithLabel;
