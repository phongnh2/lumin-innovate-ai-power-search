import { lazyWithRetry } from 'utils/lazyWithRetry';
import CreateFolder from './CreateFolder';
import EditFolder from './EditFolder';
import { FolderControllerContent } from './FolderController';

const FolderInfoModal = lazyWithRetry(() => import('./FolderInfoModal'));

export default {
  Creation: CreateFolder,
  Edit: EditFolder,
  FolderInfo: FolderInfoModal,
  Content: FolderControllerContent,
};
