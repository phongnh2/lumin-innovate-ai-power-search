import React from 'react';
import PropTypes from 'prop-types';
import * as Styled from '../SettingSection.styled';

function Container({ className, children, title }) {
  return (
    <Styled.Container className={className}>
      <Styled.Title>{title}</Styled.Title>
      <Styled.BodyContainer>
        {typeof children === 'function' ? children({
          Divider: Styled.Divider,
          ItemTitle: Styled.ItemTitle,
          ItemText: Styled.ItemText,
          ItemLayout: Styled.ItemLayout,
        }) : children}
      </Styled.BodyContainer>
    </Styled.Container>
  );
}

Container.propTypes = {
  children: PropTypes.any.isRequired,
  title: PropTypes.node.isRequired,
  className: PropTypes.string,
};
Container.defaultProps = {
  className: '',
};

export default Container;
