import { memo } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import LuminNoteHistoryItem from './LuminNoteHistoryItem';

const mapStateToProps = (state) => ({
  sortStrategy: selectors.getSortStrategy(state),
  pageLabels: selectors.getPageLabels(state),
});

const mapDispatchToProps = {};

export default memo(connect(mapStateToProps, mapDispatchToProps)(LuminNoteHistoryItem));
