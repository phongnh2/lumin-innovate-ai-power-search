import React from 'react';
import PropTypes from 'prop-types';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';

import BaseItem from '../BaseItem';
import Container from '../Container';
import * as Styled from './DeleteResourceSettings.styled';

function DeleteButton({
  children,
  onDelete,
}) {
  return (
    <Styled.DeleteButton
      size={ButtonSize.XL}
      color={ButtonColor.SECONDARY_BLACK}
      onClick={onDelete}
    >
      {children}
    </Styled.DeleteButton>
  );
}

DeleteButton.propTypes = {
  children: PropTypes.node.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function DeleteResourceSettings({
  heading,
  text,
  renderButton,
}) {
  return (
    <Container title={heading}>
      <BaseItem
        text={text}
      >
        {renderButton({ DeleteButton })}
      </BaseItem>
    </Container>
  );
}

DeleteResourceSettings.propTypes = {
  heading: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  renderButton: PropTypes.func.isRequired,
};

export default DeleteResourceSettings;
