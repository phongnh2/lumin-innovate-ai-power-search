import PropTypes from 'prop-types';
import React from 'react';

import * as Styled from './RoleTooltip.styled';

const RoleTooltip = ({ content }) => (
  <div>
    {content.map((item) => (
      <Styled.TooltipContainer key={item.label}>
        <Styled.TooltipLabel>{item.role}</Styled.TooltipLabel>
        <Styled.TooltipText>{item.content}</Styled.TooltipText>
      </Styled.TooltipContainer>
    ))}
  </div>
);

RoleTooltip.propTypes = {
  content: PropTypes.object,
};

RoleTooltip.defaultProps = {
  content: {},
};

export default RoleTooltip;
