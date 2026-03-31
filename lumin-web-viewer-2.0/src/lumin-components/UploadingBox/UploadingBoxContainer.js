import loadable from '@loadable/component';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';

import selectors from 'selectors';

import { useTabletMatch } from 'hooks';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

const UploadingBox = loadable(() => import('./UploadingBox'));

const propTypes = {
  hasItems: PropTypes.bool.isRequired,
};

function UploadingBoxContainer({ hasItems }) {
  const isTabletUp = useTabletMatch();
  const location = useLocation();
  const documentRouteMatched = matchPaths(
    [ROUTE_MATCH.DOCUMENTS, ROUTE_MATCH.ORG_DOCUMENT].map((route) => ({ path: route, end: false })),
    location.pathname
  );
  const [isCollapse, setCollapse] = useState(false);

  useEffect(() => {
    if (!hasItems) {
      setCollapse(false);
    }
  }, [hasItems]);

  if (!hasItems || !isTabletUp || !documentRouteMatched) {
    return null;
  }

  return <UploadingBox isCollapse={isCollapse} setCollapse={setCollapse} />;
}

UploadingBoxContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  const { total } = selectors.getUploadingDocumentsStat(state);
  return {
    hasItems: total > 0,
  };
};

export default connect(mapStateToProps)(React.memo(UploadingBoxContainer));
