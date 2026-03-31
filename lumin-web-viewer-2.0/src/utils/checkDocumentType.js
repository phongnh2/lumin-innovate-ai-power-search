import { supportedFileMimeType } from 'constants/supportedFiles';

export default (fileType) => supportedFileMimeType.includes(fileType);
