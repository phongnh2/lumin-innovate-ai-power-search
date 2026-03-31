import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { LEFT_PANEL_VALUES } from '@new-ui/components/LuminLeftPanel/constants';

import selectors from 'selectors';

import { OutlinePanel } from 'features/Outline/components';

import BookmarkPanel from './BookmarkPanel';
import ThumbnailPanel from './ThumbnailPanel';

const LuminLeftPanelContent = ({ leftPanelValue }) => {
  switch (leftPanelValue) {
    case LEFT_PANEL_VALUES.BOOKMARK:
      return <BookmarkPanel />;
    case LEFT_PANEL_VALUES.OUTLINE:
      return <OutlinePanel />;
    case LEFT_PANEL_VALUES.THUMBNAIL:
      return <ThumbnailPanel />;
    default:
      return null;
  }
};

LuminLeftPanelContent.propTypes = {
  leftPanelValue: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  leftPanelValue: selectors.leftPanelValue(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(LuminLeftPanelContent);
