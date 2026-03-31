import { compose } from 'redux';

import withUpdateDocumentData from 'HOC/withUpdateDocumentData';

import GoogleFilePickerWrapper from './GoogleFilePickerWrapper';
import { withHomeEditAPdfFlow } from '../TopFeaturesSection/hoc';

export default compose(withUpdateDocumentData, withHomeEditAPdfFlow)(GoogleFilePickerWrapper);
