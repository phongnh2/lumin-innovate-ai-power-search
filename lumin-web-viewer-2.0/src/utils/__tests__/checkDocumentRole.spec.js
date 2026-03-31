import checkDocumentRole, { checkPersonalDocumentAction } from '../checkDocumentRole';
import { DocumentActions, DocumentTemplateActions } from 'constants/documentConstants';

describe('checkDocumentRole', () => {
  describe('checkDocumentRole', () => {
    it('should return VIEWER for default case', () => {
      expect(checkDocumentRole('unknown')).toEqual(['view', 'open', 'comment', 'share', 'remove', 'makeStar']);
    });

    it('should return EDITOR actions', () => {
      const result = checkDocumentRole('EDITOR');
      expect(result).toContain('edit');
      expect(result.length).toBeGreaterThan(6);
    });

    it('should return SHARER actions', () => {
      const result = checkDocumentRole('SHARER');
      expect(result).toContain('rename');
    });

    it('should return OWNER actions', () => {
      const result = checkDocumentRole('OWNER');
      expect(result).toContain('createAsTemplate');
    });

    it('should return MEMBER actions', () => {
      const result = checkDocumentRole('MEMBER');
      expect(result).toContain('upload');
    });

    it('should return MODERATOR actions', () => {
      const result = checkDocumentRole('MODERATOR');
      expect(result).toContain('rename');
    });

    it('should return ADMIN actions', () => {
      const result = checkDocumentRole('ADMIN');
      expect(result).toContain('buyPremium');
    });
  });

  describe('checkPersonalDocumentAction', () => {
    it('should return VIEWER for default case', () => {
      expect(checkPersonalDocumentAction('unknown')).toContain(DocumentActions.View);
    });

    it('should return EDITOR actions', () => {
      const result = checkPersonalDocumentAction('EDITOR');
      expect(result).toContain(DocumentActions.View);
    });

    it('should return SHARER actions', () => {
      const result = checkPersonalDocumentAction('SHARER');
      expect(result).toContain(DocumentActions.Rename);
    });

    it('should return OWNER actions', () => {
      const result = checkPersonalDocumentAction('OWNER');
      expect(result).toContain(DocumentActions.Move);
      expect(result).toContain(DocumentTemplateActions.PreviewTemplate);
    });

    it('should return MEMBER actions', () => {
      const result = checkPersonalDocumentAction('MEMBER');
      expect(result).toContain(DocumentActions.View);
    });

    it('should return MODERATOR actions', () => {
      const result = checkPersonalDocumentAction('MODERATOR');
      expect(result).toContain(DocumentActions.Rename);
    });

    it('should return ADMIN actions', () => {
      const result = checkPersonalDocumentAction('ADMIN');
      expect(result).toContain(DocumentActions.Remove);
    });
  });
});
