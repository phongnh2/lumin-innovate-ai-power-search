import { connect } from 'react-redux';
import selectors from 'selectors';
import LocalSave from './LocalSave';

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
});

export default connect(mapStateToProps, null)(LocalSave);
