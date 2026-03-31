import '@testing-library/jest-dom';
import {
  DestinationLocation,
  ModalContext,
  Destination,
  PersonalData,
  FolderData,
  TotalFolder,
} from '../interfaces/TransferDocument.interface';

describe('TransferDocument.interface', () => {
  describe('DestinationLocation enum', () => {
    it('should have FOLDER value', () => {
      expect(DestinationLocation.FOLDER).toBe('FOLDER');
    });

    it('should have ORGANIZATION value', () => {
      expect(DestinationLocation.ORGANIZATION).toBe('ORGANIZATION');
    });

    it('should have PERSONAL value', () => {
      expect(DestinationLocation.PERSONAL).toBe('PERSONAL');
    });

    it('should have ORGANIZATION_TEAM value', () => {
      expect(DestinationLocation.ORGANIZATION_TEAM).toBe('ORGANIZATION_TEAM');
    });

    it('should have exactly 4 values', () => {
      expect(Object.keys(DestinationLocation)).toHaveLength(4);
    });
  });

  describe('ModalContext enum', () => {
    it('should have MOVE value', () => {
      expect(ModalContext.MOVE).toBe('MOVE');
    });

    it('should have COPY value', () => {
      expect(ModalContext.COPY).toBe('COPY');
    });

    it('should have exactly 2 values', () => {
      expect(Object.keys(ModalContext)).toHaveLength(2);
    });
  });

  describe('Destination type', () => {
    it('should allow creating a valid Destination object', () => {
      const destination: Destination = {
        _id: 'dest-123',
        name: 'Test Destination',
        type: DestinationLocation.FOLDER,
        belongsTo: {
          _id: 'org-123',
          name: 'Organization',
          type: DestinationLocation.ORGANIZATION,
        },
      };

      expect(destination._id).toBe('dest-123');
      expect(destination.name).toBe('Test Destination');
      expect(destination.type).toBe(DestinationLocation.FOLDER);
      expect(destination.belongsTo._id).toBe('org-123');
    });

    it('should allow optional scrollTo property', () => {
      const destination: Destination = {
        _id: 'dest-123',
        name: 'Test',
        type: DestinationLocation.ORGANIZATION,
        belongsTo: {
          _id: 'org-123',
          type: DestinationLocation.ORGANIZATION,
        },
        scrollTo: 'element-123',
      };

      expect(destination.scrollTo).toBe('element-123');
    });
  });

  describe('PersonalData type', () => {
    it('should allow creating a valid PersonalData object', () => {
      const personalData: PersonalData = {
        _id: 'user-123',
        isOldProfessional: true,
        originUser: { _id: 'user-123', name: 'Test User' } as any,
      };

      expect(personalData._id).toBe('user-123');
      expect(personalData.isOldProfessional).toBe(true);
      expect(personalData.originUser._id).toBe('user-123');
    });
  });

  describe('FolderData type', () => {
    it('should allow creating a valid FolderData object', () => {
      const folderData: FolderData = {
        folders: [{ _id: 'folder-1', name: 'Folder 1' }] as any,
        isLoading: false,
      };

      expect(folderData.folders).toHaveLength(1);
      expect(folderData.isLoading).toBe(false);
    });

    it('should handle empty folders', () => {
      const folderData: FolderData = {
        folders: [],
        isLoading: true,
      };

      expect(folderData.folders).toHaveLength(0);
      expect(folderData.isLoading).toBe(true);
    });
  });

  describe('TotalFolder type', () => {
    it('should allow creating a valid TotalFolder object', () => {
      const totalFolder: TotalFolder = {
        'org-123': {
          myDocuments: 10,
          orgDocuments: 25,
          teams: {
            'team-1': 5,
            'team-2': 8,
          },
        },
      };

      expect(totalFolder['org-123'].myDocuments).toBe(10);
      expect(totalFolder['org-123'].orgDocuments).toBe(25);
      expect(totalFolder['org-123'].teams['team-1']).toBe(5);
    });
  });
});

