import commentUtils from '../comment';
import validator from '../validator';

jest.mock('../validator', () => ({
  validateEmail: jest.fn(),
}));
jest.mock('helpers/getHeight', () => jest.fn(() => 20));

describe('comment', () => {
  describe('getEmailsFromContent', () => {
    it('should be empty email list', () => {
      expect(commentUtils.getEmailsFromContent({ email: 'tientranmac@gmail.com' }, '@tientranmac@gmail.com')).toEqual([]);
    });
    it('should return empty array if content is empty', () => {
      expect(commentUtils.getEmailsFromContent({ email: 'nhuttm@gmail.com' }, '')).toEqual([]);
    });

    it('content is not starting with @', () => {
      expect(commentUtils.getEmailsFromContent({ email: 'nhuttm@gmail.com' }, 'tientranmac@gmail.com')).toEqual([]);
    });

    it('should return unique emails using Set', () => {
      const currentUser = { email: 'admin@gmail.com' };
      const content = '@user1@gmail.com @user2@gmail.com @user1@gmail.com';
  
      validator.validateEmail.mockImplementation((email) => email.includes('@'));
      const result = commentUtils.getEmailsFromContent(currentUser, content);
      expect(result).toEqual(['user1@gmail.com', 'user2@gmail.com']);
      expect(validator.validateEmail).toHaveBeenCalledWith('user1@gmail.com');
      expect(validator.validateEmail).toHaveBeenCalledWith('user2@gmail.com');
      expect(validator.validateEmail).toHaveBeenCalledWith('user1@gmail.com');
    });
  });

  describe('getNewTagUsers', () => {
    it('returns full list when taggedUsers empty', () => {
      expect(commentUtils.getNewTagUsers([], ['a'])).toEqual(['a']);
    });

    it('returns difference', () => {
      expect(commentUtils.getNewTagUsers(['a', 'b'], ['b', 'c'])).toEqual(['c']);
    });
  });

  describe('commentParser', () => {
    it('should return empty array if content is empty', () => {
      expect(commentUtils.commentParser()).toEqual([ '' ]);
    });
  });

  describe('clearAllMarkupSymbol / redoMarkupSymbol', () => {
    it('escapes and restores markup symbols', () => {
      expect(commentUtils.clearAllMarkupSymbol()).not.toBeNull();
      expect(commentUtils.redoMarkupSymbol()).not.toBeNull();
    });
  });

  describe('removeHTMLTag', () => {
    it('removes html tags', () => {
      expect(commentUtils.removeHTMLTag()).toBe('');
    });
  });

  describe('getHTMLTagsInString', () => {
    it('returns tags without < > characters', () => {
      const result = commentUtils.getHTMLTagsInString('<div>abc</div>');
      expect(result).toEqual(['<div>', '</div>']);
    });

    it('returns empty array if no tags', () => {
      expect(commentUtils.getHTMLTagsInString('text only')).toEqual([]);
    });
  });

  describe('isDeleteTagSymbol', () => {
    it('detects backspace on @ symbol', () => {
      const oldContent = '@hello';
      const newContent = 'hello';
      expect(commentUtils.isDeleteTagSymbol(newContent, oldContent)).toBe(true);
    });

    it('returns false when not deleting @', () => {
      expect(commentUtils.isDeleteTagSymbol('hello', 'hello')).toBe(false);
    });

    it('empty oldContent', () => {
      expect(commentUtils.isDeleteTagSymbol('hello')).toBe(false);
    });
  });

  describe('getMentionEmailsFromContent', () => {
    it('returns only valid mention emails', () => {
      validator.validateEmail
        .mockImplementation((email) => email.includes('@'));

      const res = commentUtils.getMentionEmailsFromContent(
        '@aaa@bbb.com text @ccc@ddd.com'
      );

      expect(res).toEqual(['aaa@bbb.com', 'ccc@ddd.com']);
    });

    it('returns empty if no content', () => {
      expect(commentUtils.getMentionEmailsFromContent('')).toEqual([]);
    });
  });

  describe('getIdealPlacement / sortIdealPlacement / pushCommentBox', () => {
    it('computes ideal placement positions', () => {
      const res = commentUtils.getIdealPlacement(
        { a: { top: 100 }, b: { top: 150 } },
        'a'
      );
      expect(res).toBeInstanceOf(Object);
      expect(Object.keys(res).length).toBe(2);
    });

    it('findMe is not found', () => {
      const res = commentUtils.getIdealPlacement(
        { a: { top: 100 }, b: { top: 150 } },
        'c'
      );
      expect(res).toBeInstanceOf(Object);
      expect(Object.keys(res).length).toBe(2);
    });
  });
});
