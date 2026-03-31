import React from 'react';
import PropTypes from 'prop-types';

import Tooltip from 'luminComponents/Shared/Tooltip';
import * as Styled from './DocumentOwnerName.styled';

function DocumentOwnerName({ ownerName, disabled }) {
  return (
    <Styled.OwnerWrapper>
      <Tooltip
        title={disabled ? '' : ownerName}
        PopperProps={{
          disablePortal: true,
        }}
        disableHoverListener={disabled}
        tooltipStyle={{
          zIndex: 2,
        }}
      >
        <Styled.OwnerName>{ownerName}</Styled.OwnerName>
      </Tooltip>
    </Styled.OwnerWrapper>
  );
}

DocumentOwnerName.propTypes = {
  ownerName: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};
DocumentOwnerName.defaultProps = {
  disabled: false,
};

export default DocumentOwnerName;
