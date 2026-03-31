import { isObject } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { ENV } from 'constants/urls';

import * as Styled from './BadRequestPage.styled';

const BadRequestPage = ({ id, image, title, description, buttons, error, ...otherProps }) => {
  const getErrorInfo = () => {
    if (ENV === 'production' || !isObject(error)) {
      return null;
    }
    return (
      <>
        <div>Error Info:</div>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
          {Object.entries(error).map(([key, value]) => (
            <li>{`${key}: ${value}`}</li>
          ))}
        </ul>
      </>
    );
  };
  return (
    <Styled.Container>
      <Styled.Image src={image} alt={`${id}-image`} />
      <Styled.Title $isWrap={otherProps.isTitleWrap}>{title}</Styled.Title>
      <Styled.Message>
        {description}
        {getErrorInfo()}
      </Styled.Message>
      <Styled.ButtonGroup $flexEnd={otherProps.flexEnd}>{buttons}</Styled.ButtonGroup>
    </Styled.Container>
  );
};

BadRequestPage.propTypes = {
  id: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  buttons: PropTypes.element.isRequired,
  error: PropTypes.object,
};

export default BadRequestPage;
