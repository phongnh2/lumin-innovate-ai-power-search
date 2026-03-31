import '@testing-library/jest-dom';
import { ResultTabs, TYPE_TABS } from '../constants/moveDocumentConstant';

describe('moveDocumentConstant', () => {
  describe('ResultTabs', () => {
    it('should have TEAMS value', () => {
      expect(ResultTabs.TEAMS).toBe('TEAMS');
    });

    it('should have FOLDERS value', () => {
      expect(ResultTabs.FOLDERS).toBe('FOLDERS');
    });

    it('should have exactly 2 values', () => {
      expect(Object.keys(ResultTabs)).toHaveLength(2);
    });
  });

  describe('TYPE_TABS', () => {
    it('should map TEAMS to ORGANIZATION_TEAM', () => {
      expect(TYPE_TABS[ResultTabs.TEAMS]).toBe('ORGANIZATION_TEAM');
    });

    it('should map FOLDERS to FOLDER', () => {
      expect(TYPE_TABS[ResultTabs.FOLDERS]).toBe('FOLDER');
    });

    it('should have entries for all ResultTabs values', () => {
      Object.values(ResultTabs).forEach((tab) => {
        expect(TYPE_TABS[tab]).toBeDefined();
      });
    });
  });
});

