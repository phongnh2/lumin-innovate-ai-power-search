class UploadUtils {
  static UploadStatus = {
    PROCESSING: 'processing',
    UPLOADING: 'uploading',
    COMPLETED: 'completed',
    ERROR: 'error',
  }

  static getRestartTask(groupId, uploadingFiles) {
    return uploadingFiles.find((fileUpload) => fileUpload.oldGroupIndice.includes(groupId) && fileUpload.status === UploadUtils.UploadStatus.PROCESSING);
  }

  static isFreeQueue(uploadingFiles) {
    return uploadingFiles.every((fileUpload) => [UploadUtils.UploadStatus.ERROR, UploadUtils.UploadStatus.COMPLETED].includes(fileUpload.status));
  }

  static getFileIndex(uploadingFiles, groupId) {
    return uploadingFiles.findIndex((fileUpload) => fileUpload.groupId === groupId);
  }

  static getFileByGroupId(uploadingFiles, groupId) {
    return uploadingFiles.find((file) => file.groupId === groupId);
  }

  static isEndOfQueue(files, groupId) {
    const currentIndex = UploadUtils.getFileIndex(files, groupId);
    return currentIndex === files.length - 1;
  }

  static getNextFile(files, groupId) {
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      const file = files[i];
      const hasNextFile = file.groupId === groupId && i < filesLength - 1;
      if (hasNextFile || file.oldGroupIndice.includes(groupId)) {
        return files[i + 1];
      }
    }

    return null;
  }

  static countUploadingFiles(files) {
    let count = 0;
    for (let i = 0; i < files.length; i += 1) {
      if ([
        UploadUtils.UploadStatus.PROCESSING,
        UploadUtils.UploadStatus.UPLOADING,
      ].includes(files[i].status)) {
        count++;
      }
    }
    return count;
  }

  static isAll(files, status) {
    return files.every((file) => file.status === status);
  }
}

export default UploadUtils;
