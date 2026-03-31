import { findFileEntry, findElectronFileEntry } from '../localFileServices';
import { PLATFORM, PlatformType } from 'screens/OpenLumin/constants';

describe('localFileServices', () => {
  describe('findFileEntry', () => {
    it('should find file entry with matching fileHandle', async () => {
      const mockFileHandle1 = {
        isSameEntry: jest.fn().mockResolvedValue(false),
      };

      const mockFileHandle2 = {
        isSameEntry: jest.fn().mockResolvedValue(true),
      };

      const mockFileHandle3 = {
        isSameEntry: jest.fn().mockResolvedValue(false),
      };

      const inputArr = [
        { fileHandle: mockFileHandle1, platform: 'web' },
        { fileHandle: mockFileHandle2, platform: 'web' },
        { fileHandle: mockFileHandle3, platform: 'web' },
      ];

      const validatedFile = {
        isSameEntry: jest.fn(),
      };

      const result = await findFileEntry(inputArr as any, validatedFile);

      expect(mockFileHandle1.isSameEntry).toHaveBeenCalledWith(validatedFile);
      expect(mockFileHandle2.isSameEntry).toHaveBeenCalledWith(validatedFile);
      expect(result).toEqual(inputArr[1]);
    });

    it('should return null if no matching file entry found', async () => {
      const mockFileHandle1 = {
        isSameEntry: jest.fn().mockResolvedValue(false),
      };

      const mockFileHandle2 = {
        isSameEntry: jest.fn().mockResolvedValue(false),
      };

      const inputArr = [
        { fileHandle: mockFileHandle1, platform: 'web' },
        { fileHandle: mockFileHandle2, platform: 'web' },
      ];

      const validatedFile = {
        isSameEntry: jest.fn(),
      };

      const result = await findFileEntry(inputArr as any, validatedFile);

      expect(result).toBeNull();
    });

    it('should skip electron platform documents', async () => {
      const mockFileHandle = {
        isSameEntry: jest.fn().mockResolvedValue(true),
      };

      const inputArr = [
        { fileHandle: mockFileHandle, platform: PLATFORM.ELECTRON },
        { fileHandle: mockFileHandle, platform: 'web' },
      ];

      const validatedFile = {
        isSameEntry: jest.fn(),
      };

      const result = await findFileEntry(inputArr as any, validatedFile);

      expect(mockFileHandle.isSameEntry).toHaveBeenCalledTimes(1);
      expect(result).toEqual(inputArr[1]);
    });

    it('should skip documents without fileHandle', async () => {
      const mockFileHandle = {
        isSameEntry: jest.fn().mockResolvedValue(true),
      };

      const inputArr = [
        { platform: 'web' as PlatformType },
        { fileHandle: mockFileHandle, platform: 'web' },
      ];

      const validatedFile = {
        isSameEntry: jest.fn(),
      };

      const result = await findFileEntry(inputArr as any, validatedFile);

      expect(mockFileHandle.isSameEntry).toHaveBeenCalledTimes(1);
      expect(result).toEqual(inputArr[1]);
    });

    it('should return null for empty array', async () => {
      const validatedFile = {
        isSameEntry: jest.fn(),
      };

      const result = await findFileEntry([], validatedFile);

      expect(result).toBeNull();
    });

    it('should handle async operations correctly', async () => {
      const mockFileHandle1 = {
        isSameEntry: jest.fn().mockImplementation(() =>
          new Promise((resolve) => setTimeout(() => resolve(false), 10))
        ),
      };

      const mockFileHandle2 = {
        isSameEntry: jest.fn().mockImplementation(() =>
          new Promise((resolve) => setTimeout(() => resolve(true), 5))
        ),
      };

      const inputArr = [
        { fileHandle: mockFileHandle1, platform: 'web' },
        { fileHandle: mockFileHandle2, platform: 'web' },
      ];

      const validatedFile = {
        isSameEntry: jest.fn(),
      };

      const result = await findFileEntry(inputArr as any, validatedFile);

      expect(result).toEqual(inputArr[1]);
    });
  });

  describe('findElectronFileEntry', () => {
    it('should find electron file entry with matching filePath', async () => {
      const inputArr = [
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file1.pdf' },
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file2.pdf' },
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file3.pdf' },
      ];

      const result = await findElectronFileEntry(inputArr, '/path/to/file2.pdf');

      expect(result).toEqual(inputArr[1]);
    });

    it('should return null if no matching file entry found', async () => {
      const inputArr = [
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file1.pdf' },
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file2.pdf' },
      ];

      const result = await findElectronFileEntry(inputArr, '/path/to/file3.pdf');

      expect(result).toBeNull();
    });

    it('should skip non-electron platform documents', async () => {
      const inputArr = [
        { platform: 'web', filePath: '/path/to/file1.pdf' },
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file1.pdf' },
      ];

      const result = await findElectronFileEntry(inputArr as any, '/path/to/file1.pdf');

      expect(result).toEqual(inputArr[1]);
    });

    it('should return null for empty array', async () => {
      const result = await findElectronFileEntry([], '/path/to/file.pdf');

      expect(result).toBeNull();
    });

    it('should handle case-sensitive file paths', async () => {
      const inputArr = [
        { platform: PLATFORM.ELECTRON, filePath: '/Path/To/File.pdf' },
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file.pdf' },
      ];

      const result = await findElectronFileEntry(inputArr, '/path/to/file.pdf');

      expect(result).toEqual(inputArr[1]);
    });

    it('should find first matching entry when multiple matches exist', async () => {
      const inputArr = [
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file.pdf', _id: '1' },
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file.pdf', _id: '2' },
      ];

      const result = await findElectronFileEntry(inputArr, '/path/to/file.pdf');

      expect(result).toEqual(inputArr[0]);
    });

    it('should handle documents without filePath', async () => {
      const inputArr = [
        { platform: PLATFORM.ELECTRON as PlatformType },
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file.pdf' },
      ];

      const result = await findElectronFileEntry(inputArr, '/path/to/file.pdf');

      expect(result).toEqual(inputArr[1]);
    });

    it('should handle undefined platform', async () => {
      const inputArr = [
        { filePath: '/path/to/file.pdf' } as any,
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file.pdf' },
      ];

      const result = await findElectronFileEntry(inputArr, '/path/to/file.pdf');

      expect(result).toEqual(inputArr[1]);
    });

    it('should handle special characters in file paths', async () => {
      const specialPath = '/path/to/file with spaces & special-chars.pdf';
      const inputArr = [
        { platform: PLATFORM.ELECTRON, filePath: specialPath },
      ];

      const result = await findElectronFileEntry(inputArr, specialPath);

      expect(result).toEqual(inputArr[0]);
    });
  });

  describe('edge cases', () => {
    it('should handle mixed array with web and electron documents in findFileEntry', async () => {
      const mockFileHandle = {
        isSameEntry: jest.fn().mockResolvedValue(true),
      };

      const inputArr = [
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file.pdf' },
        { fileHandle: mockFileHandle, platform: 'web' },
      ];

      const validatedFile = {
        isSameEntry: jest.fn(),
      };

      const result = await findFileEntry(inputArr as any, validatedFile);

      expect(result).toEqual(inputArr[1]);
    });

    it('should handle mixed array with web and electron documents in findElectronFileEntry', async () => {
      const mockFileHandle = {
        isSameEntry: jest.fn(),
      };

      const inputArr = [
        { fileHandle: mockFileHandle, platform: 'web' },
        { platform: PLATFORM.ELECTRON, filePath: '/path/to/file.pdf' },
      ];

      const result = await findElectronFileEntry(inputArr as any, '/path/to/file.pdf');

      expect(result).toEqual(inputArr[1]);
    });

    it('should handle empty string filePath', async () => {
      const inputArr = [
        { platform: PLATFORM.ELECTRON, filePath: '' },
      ];

      const result = await findElectronFileEntry(inputArr, '');

      expect(result).toEqual(inputArr[0]);
    });
  });
});
