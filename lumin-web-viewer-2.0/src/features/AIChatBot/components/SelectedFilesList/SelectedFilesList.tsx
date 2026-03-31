import { Chip, CircularProgress, Icomoon, ScrollArea } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { getTruncatedFileName } from 'utils/getTruncatedFileName';

import { ATTACHED_FILES_STATUS } from 'features/AIChatBot/constants/attachedFiles';
import { AttachedFileType, HandleRemoveAttachedFileProps } from 'features/AIChatBot/interface';

import styles from './SelectedFilesList.module.scss';

interface SelectedFilesListProps {
  files: AttachedFileType[];
  isUploadingFile: boolean;
  onRemove?: (props: HandleRemoveAttachedFileProps) => void;
}

const SelectedFilesList: React.FC<SelectedFilesListProps> = ({ files, isUploadingFile, onRemove }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <ScrollArea type="never">
        <div className={styles.filesContainer}>
          {files.map((file, idx) => (
            <div key={`${file.id}-${idx}`} className={styles.chipWrapper}>
              <Chip
                label={getTruncatedFileName({ filename: file.file.name })}
                size="sm"
                colorType="grey"
                rounded
                className={styles.fileChip}
              />
              <div
                className={styles.closeIcon}
                role="button"
                tabIndex={0}
                onClick={() => onRemove?.({ removeId: file.id, fileIndex: idx })}
              >
                {isUploadingFile && file.status === ATTACHED_FILES_STATUS.UPLOADING ? (
                  <CircularProgress size="xs" />
                ) : (
                  <Icomoon type="ph-x-circle" size="sm" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SelectedFilesList;
