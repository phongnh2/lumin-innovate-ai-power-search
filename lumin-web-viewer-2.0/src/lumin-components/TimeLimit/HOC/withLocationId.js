import React from 'react';
import PropTypes from 'prop-types';

import { DOCUMENT_TYPE } from 'constants/documentConstants';

const withLocationId = (Component) => {
  const HOC = (props) => {
    const { currentDocument } = props;
    const {
      belongsTo: { location, type, workspaceId },
    } = currentDocument;

    const getLocationId = () => {
      if ([DOCUMENT_TYPE.ORGANIZATION, DOCUMENT_TYPE.ORGANIZATION_TEAM].includes(type)) {
        return location._id;
      }

      return workspaceId;
    };

    return <Component locationId={getLocationId()} {...props} />;
  };

  HOC.propTypes = {
    currentDocument: PropTypes.object,
  };

  HOC.defaultProps = {
    currentDocument: {},
  };

  return HOC;
};

export default withLocationId;
