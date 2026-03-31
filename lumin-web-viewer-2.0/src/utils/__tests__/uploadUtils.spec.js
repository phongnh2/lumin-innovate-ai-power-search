import uploadUtils from '../uploadUtils';

describe('uploadUtils', () => {
  const files = [
    { groupId: 'g1', oldGroupIndice: ['g0'], status: uploadUtils.UploadStatus.PROCESSING },
    { groupId: 'g2', oldGroupIndice: [], status: uploadUtils.UploadStatus.UPLOADING },
    { groupId: 'g3', oldGroupIndice: ['g2'], status: uploadUtils.UploadStatus.COMPLETED },
    { groupId: 'g4', oldGroupIndice: [], status: uploadUtils.UploadStatus.ERROR },
  ];

  describe('getRestartTask', () => {
    it('should return the first processing file with matching oldGroupIndice', () => {
      const result = uploadUtils.getRestartTask('g0', files);
      expect(result.groupId).toBe('g1');
    });

    it('should return undefined if no match', () => {
      const result = uploadUtils.getRestartTask('g5', files);
      expect(result).toBeUndefined();
    });
  });

  describe('isFreeQueue', () => {
    it('should return false if some files are processing or uploading', () => {
      expect(uploadUtils.isFreeQueue(files)).toBe(false);
    });

    it('should return true if all files are error or completed', () => {
      const completedOrError = [
        { groupId: 'g1', status: uploadUtils.UploadStatus.ERROR },
        { groupId: 'g2', status: uploadUtils.UploadStatus.COMPLETED },
      ];
      expect(uploadUtils.isFreeQueue(completedOrError)).toBe(true);
    });
  });

  describe('getFileIndex', () => {
    it('should return correct index', () => {
      expect(uploadUtils.getFileIndex(files, 'g2')).toBe(1);
      expect(uploadUtils.getFileIndex(files, 'g5')).toBe(-1);
    });
  });

  describe('getFileByGroupId', () => {
    it('should return the file with given groupId', () => {
      const file = uploadUtils.getFileByGroupId(files, 'g3');
      expect(file.groupId).toBe('g3');
    });

    it('should return undefined if not found', () => {
      expect(uploadUtils.getFileByGroupId(files, 'g5')).toBeUndefined();
    });
  });

  describe('isEndOfQueue', () => {
    it('should return true if groupId is last file', () => {
      expect(uploadUtils.isEndOfQueue(files, 'g4')).toBe(true);
    });

    it('should return false otherwise', () => {
      expect(uploadUtils.isEndOfQueue(files, 'g2')).toBe(false);
    });
  });

  describe('getNextFile', () => {
    it('should return next file after matching groupId', () => {
      const nextFile = uploadUtils.getNextFile(files, 'g1');
      expect(nextFile.groupId).toBe('g2');
    });

    it('should return next file if oldGroupIndice includes groupId', () => {
      const nextFile = uploadUtils.getNextFile(files, 'g2');
      expect(nextFile.groupId).toBe('g3');
    });

    it('should return null if no next file', () => {
      const nextFile = uploadUtils.getNextFile(files, 'g4');
      expect(nextFile).toBeNull();
    });
  });

  describe('countUploadingFiles', () => {
    it('should count files with processing or uploading status', () => {
      expect(uploadUtils.countUploadingFiles(files)).toBe(2);
    });
  });

  describe('isAll', () => {
    it('should return true if all files have the given status', () => {
      const completedFiles = [
        { groupId: 'g1', status: uploadUtils.UploadStatus.COMPLETED },
        { groupId: 'g2', status: uploadUtils.UploadStatus.COMPLETED },
      ];
      expect(uploadUtils.isAll(completedFiles, uploadUtils.UploadStatus.COMPLETED)).toBe(true);
    });

    it('should return false if any file has different status', () => {
      expect(uploadUtils.isAll(files, uploadUtils.UploadStatus.COMPLETED)).toBe(false);
    });
  });
});
