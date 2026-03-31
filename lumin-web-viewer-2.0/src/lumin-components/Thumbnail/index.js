import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import Thumbnail, { THUMBNAIL_SIZE } from './Thumbnail';

export { THUMBNAIL_SIZE };
const mapStateToProps = state => ({
  currentPage: selectors.getCurrentPage(state),
  pageLabels: selectors.getPageLabels(state),
  selectedPageIndexes: selectors.getSelectedThumbnailPageIndexes(state),
  isThumbnailMultiselectEnabled: selectors.getIsThumbnailMultiselectEnabled(state),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
  setSelectedPageThumbnails: actions.setSelectedPageThumbnails,
};

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail);
