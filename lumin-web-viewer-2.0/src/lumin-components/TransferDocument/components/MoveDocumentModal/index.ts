import loadable from '@loadable/component';

const MoveDocumentModalLoadable = loadable(() => import('./MoveDocumentModal'));

export default MoveDocumentModalLoadable;
export { default as MoveDocumentModalContainer } from './MoveDocumentModalContainer';
