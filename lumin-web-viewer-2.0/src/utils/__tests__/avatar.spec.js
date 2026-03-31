import avatar from '../avatar';

describe('avatar function', () => {
  describe('get avatar', () => {
    it('should be url', () => {
      expect(avatar.getAvatar('Loremipsumdolorsit')).toContain('Loremipsumdolorsit');
    });
    it('should be null when does not pass param', () => {
      expect(avatar.getAvatar()).toBe(null);
    });
    it('should be null when passing empty string', () => {
      expect(avatar.getAvatar('')).toBe(null);
    });
  });

  describe('get text avatar', () => {
    it('should be the first character', () => {
      expect(avatar.getTextAvatar('Robert')).toBe('R');
    });
    it('should be null when passing empty string', () => {
      expect(avatar.getTextAvatar('')).toBe(null);
    });
    it('should be null when does not pass param', () => {
      expect(avatar.getTextAvatar()).toBe(null);
    });
    it('shoud be the first and last character when name of user > 2', () => {
      expect(avatar.getTextAvatar('Robert DJ')).toBe('RD');
    });
  });
});

