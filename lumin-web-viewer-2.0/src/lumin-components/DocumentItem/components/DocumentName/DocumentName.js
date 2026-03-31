import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Highlighter from 'react-highlight-words';

import { DocumentSearchContext } from 'lumin-components/Document/context';
import Tooltip from 'luminComponents/Shared/Tooltip';
import * as Styled from './DocumentName.styled';

function DocumentName({ name, disabled }) {
  const { searchKey } = useContext(DocumentSearchContext);
  return (
    <Tooltip
      title={disabled ? '' : name}
      PopperProps={{
        disablePortal: true,
      }}
      disableHoverListener={disabled}
      tooltipStyle={{
        zIndex: 2,
      }}
    >
      <Styled.Name>
        <Highlighter
          highlightClassName="text-highlight"
          searchWords={[searchKey]}
          autoEscape
          textToHighlight={name}
        />
      </Styled.Name>
    </Tooltip>
  );
}

DocumentName.propTypes = {
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default DocumentName;
