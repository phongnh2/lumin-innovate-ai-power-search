import { addCounterToFolderName, addCounterToFilename, getUniqueName } from '../utils';

// Mock the constant
jest.mock('constants/documentConstants', () => ({
  MAX_LENGTH_DOCUMENT_NAME: 240,
}));

describe('MultipleDownLoad utils', () => {
  describe('addCounterToFolderName', () => {
    it('should add counter to folder name', () => {
      expect(addCounterToFolderName('MyFolder', 1)).toBe('MyFolder (1)');
    });

    it('should handle different counter values', () => {
      expect(addCounterToFolderName('Documents', 5)).toBe('Documents (5)');
      expect(addCounterToFolderName('Documents', 10)).toBe('Documents (10)');
      expect(addCounterToFolderName('Documents', 100)).toBe('Documents (100)');
    });

    it('should handle empty folder name', () => {
      expect(addCounterToFolderName('', 1)).toBe(' (1)');
    });

    it('should handle folder names with special characters', () => {
      expect(addCounterToFolderName('My-Folder_2023', 2)).toBe('My-Folder_2023 (2)');
    });

    it('should handle folder names with spaces', () => {
      expect(addCounterToFolderName('My Folder Name', 3)).toBe('My Folder Name (3)');
    });
  });

  describe('addCounterToFilename', () => {
    it('should add counter before file extension', () => {
      expect(addCounterToFilename('document.pdf', 1)).toBe('document (1).pdf');
    });

    it('should handle files without extension', () => {
      expect(addCounterToFilename('README', 1)).toBe('README (1)');
    });

    it('should handle files with multiple dots', () => {
      expect(addCounterToFilename('file.name.with.dots.pdf', 2)).toBe('file.name.with.dots (2).pdf');
    });

    it('should handle different counter values', () => {
      expect(addCounterToFilename('file.txt', 5)).toBe('file (5).txt');
      expect(addCounterToFilename('file.txt', 10)).toBe('file (10).txt');
    });

    it('should handle empty filename', () => {
      expect(addCounterToFilename('', 1)).toBe(' (1)');
    });

    it('should handle filename starting with dot', () => {
      expect(addCounterToFilename('.gitignore', 1)).toBe(' (1).gitignore');
    });

    it('should preserve file extension case', () => {
      expect(addCounterToFilename('Document.PDF', 1)).toBe('Document (1).PDF');
    });
  });

  describe('getUniqueName', () => {
    describe('for folders', () => {
      it('should return original name if not used', () => {
        const usedNames = new Set<string>();
        const result = getUniqueName({ name: 'MyFolder', usedNames, kind: 'folder' });
        
        expect(result).toBe('MyFolder');
        expect(usedNames.has('MyFolder')).toBe(true);
      });

      it('should add counter if name is already used', () => {
        const usedNames = new Set<string>(['MyFolder']);
        const result = getUniqueName({ name: 'MyFolder', usedNames, kind: 'folder' });
        
        expect(result).toBe('MyFolder (1)');
        expect(usedNames.has('MyFolder (1)')).toBe(true);
      });

      it('should increment counter until unique name is found', () => {
        const usedNames = new Set<string>(['MyFolder', 'MyFolder (1)', 'MyFolder (2)']);
        const result = getUniqueName({ name: 'MyFolder', usedNames, kind: 'folder' });
        
        expect(result).toBe('MyFolder (3)');
      });

      it('should add name to usedNames set', () => {
        const usedNames = new Set<string>();
        getUniqueName({ name: 'NewFolder', usedNames, kind: 'folder' });
        
        expect(usedNames.has('NewFolder')).toBe(true);
      });
    });

    describe('for documents', () => {
      it('should return original name if not used', () => {
        const usedNames = new Set<string>();
        const result = getUniqueName({ name: 'document.pdf', usedNames, kind: 'doc' });
        
        expect(result).toBe('document.pdf');
        expect(usedNames.has('document.pdf')).toBe(true);
      });

      it('should add counter before extension if name is already used', () => {
        const usedNames = new Set<string>(['document.pdf']);
        const result = getUniqueName({ name: 'document.pdf', usedNames, kind: 'doc' });
        
        expect(result).toBe('document (1).pdf');
        expect(usedNames.has('document (1).pdf')).toBe(true);
      });

      it('should increment counter until unique name is found', () => {
        const usedNames = new Set<string>(['file.pdf', 'file (1).pdf', 'file (2).pdf']);
        const result = getUniqueName({ name: 'file.pdf', usedNames, kind: 'doc' });
        
        expect(result).toBe('file (3).pdf');
      });

      it('should handle files without extension', () => {
        const usedNames = new Set<string>(['README']);
        const result = getUniqueName({ name: 'README', usedNames, kind: 'doc' });
        
        expect(result).toBe('README (1)');
      });
    });

    describe('multiple unique names', () => {
      it('should generate multiple unique folder names', () => {
        const usedNames = new Set<string>();
        
        const name1 = getUniqueName({ name: 'Folder', usedNames, kind: 'folder' });
        const name2 = getUniqueName({ name: 'Folder', usedNames, kind: 'folder' });
        const name3 = getUniqueName({ name: 'Folder', usedNames, kind: 'folder' });
        
        expect(name1).toBe('Folder');
        expect(name2).toBe('Folder (1)');
        expect(name3).toBe('Folder (2)');
      });

      it('should generate multiple unique document names', () => {
        const usedNames = new Set<string>();
        
        const name1 = getUniqueName({ name: 'doc.pdf', usedNames, kind: 'doc' });
        const name2 = getUniqueName({ name: 'doc.pdf', usedNames, kind: 'doc' });
        const name3 = getUniqueName({ name: 'doc.pdf', usedNames, kind: 'doc' });
        
        expect(name1).toBe('doc.pdf');
        expect(name2).toBe('doc (1).pdf');
        expect(name3).toBe('doc (2).pdf');
      });

      it('should handle mixed folder and document names', () => {
        const usedNames = new Set<string>();
        
        const folder = getUniqueName({ name: 'MyData', usedNames, kind: 'folder' });
        const doc = getUniqueName({ name: 'MyData', usedNames, kind: 'doc' });
        
        expect(folder).toBe('MyData');
        // Since 'MyData' is already in usedNames, doc gets counter
        expect(doc).toBe('MyData (1)');
      });
    });

    describe('long names truncation', () => {
      it('should truncate very long folder names', () => {
        const usedNames = new Set<string>();
        const longName = 'A'.repeat(300);
        
        const result = getUniqueName({ name: longName, usedNames, kind: 'folder' });
        
        expect(result.length).toBeLessThanOrEqual(240);
      });

      it('should truncate very long document names while preserving extension', () => {
        const usedNames = new Set<string>();
        const longName = 'A'.repeat(300) + '.pdf';
        
        const result = getUniqueName({ name: longName, usedNames, kind: 'doc' });
        
        expect(result.endsWith('.pdf')).toBe(true);
      });

      it('should not truncate names within limit', () => {
        const usedNames = new Set<string>();
        const normalName = 'normal-document.pdf';
        
        const result = getUniqueName({ name: normalName, usedNames, kind: 'doc' });
        
        expect(result).toBe(normalName);
      });
    });

    describe('edge cases', () => {
      it('should handle empty name', () => {
        const usedNames = new Set<string>();
        const result = getUniqueName({ name: '', usedNames, kind: 'doc' });
        
        expect(result).toBe('');
      });

      it('should handle name with only extension', () => {
        const usedNames = new Set<string>();
        const result = getUniqueName({ name: '.pdf', usedNames, kind: 'doc' });
        
        expect(result).toBe('.pdf');
      });

      it('should handle special characters in name', () => {
        const usedNames = new Set<string>();
        const result = getUniqueName({ name: 'file@#$%.pdf', usedNames, kind: 'doc' });
        
        expect(result).toBe('file@#$%.pdf');
      });
    });
  });
});

