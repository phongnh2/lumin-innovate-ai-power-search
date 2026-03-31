import loadable from '@loadable/component';

import CopyDocumentModalComponent from './CopyDocumentModal';

const CopyDocumentModalLoadable = loadable(() => import('./CopyDocumentModalContainer'));

export { CopyDocumentModalComponent };

export default CopyDocumentModalLoadable;
