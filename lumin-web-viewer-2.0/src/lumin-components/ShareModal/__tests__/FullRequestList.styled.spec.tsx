import * as Styled from '../components/FullRequestList/FullRequestList.styled';

describe('FullRequestList.styled', () => {
  describe('styled components exports', () => {
    it('should export Container', () => {
      expect(Styled.Container).toBeDefined();
    });

    it('should export Header', () => {
      expect(Styled.Header).toBeDefined();
    });
  });

  describe('Container component', () => {
    it('should be a styled component', () => {
      expect(typeof Styled.Container).toBe('object');
      expect(Styled.Container.displayName).toBeDefined();
    });
  });

  describe('Header component', () => {
    it('should be a styled component', () => {
      expect(typeof Styled.Header).toBe('object');
      expect(Styled.Header.displayName).toBeDefined();
    });
  });
});

