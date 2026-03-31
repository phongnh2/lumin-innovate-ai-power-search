import * as Styled from '../ShareModal.styled';

describe('ShareModal.styled', () => {
  describe('theme', () => {
    it('should export theme object', () => {
      expect(Styled.theme).toBeDefined();
    });

    it('should have light theme', () => {
      expect(Styled.theme.light).toBeDefined();
    });

    it('should have dark theme', () => {
      expect(Styled.theme.dark).toBeDefined();
    });

    it('should have backgroundContainer in light theme', () => {
      expect(Styled.theme.light.backgroundContainer).toBeDefined();
    });

    it('should have backgroundContainer in dark theme', () => {
      expect(Styled.theme.dark.backgroundContainer).toBeDefined();
    });

    it('should have boxShadow in light theme', () => {
      expect(Styled.theme.light.boxShadow).toBeDefined();
    });

    it('should have boxShadow in dark theme', () => {
      expect(Styled.theme.dark.boxShadow).toBeDefined();
    });

    it('should have title color in light theme', () => {
      expect(Styled.theme.light.title).toBeDefined();
    });

    it('should have title color in dark theme', () => {
      expect(Styled.theme.dark.title).toBeDefined();
    });

    it('should have subTitle color in both themes', () => {
      expect(Styled.theme.light.subTitle).toBeDefined();
      expect(Styled.theme.dark.subTitle).toBeDefined();
    });

    it('should have divider color in both themes', () => {
      expect(Styled.theme.light.divider).toBeDefined();
      expect(Styled.theme.dark.divider).toBeDefined();
    });
  });

  describe('styled components exports', () => {
    it('should export TitleContainer', () => {
      expect(Styled.TitleContainer).toBeDefined();
    });

    it('should export Title', () => {
      expect(Styled.Title).toBeDefined();
    });

    it('should export TitleSecondary', () => {
      expect(Styled.TitleSecondary).toBeDefined();
    });

    it('should export SubTitle', () => {
      expect(Styled.SubTitle).toBeDefined();
    });

    it('should export SubTitleSecondary', () => {
      expect(Styled.SubTitleSecondary).toBeDefined();
    });

    it('should export SlotRemaining', () => {
      expect(Styled.SlotRemaining).toBeDefined();
    });

    it('should export TopBlockContainer', () => {
      expect(Styled.TopBlockContainer).toBeDefined();
    });

    it('should export TopBlockContainerReskin', () => {
      expect(Styled.TopBlockContainerReskin).toBeDefined();
    });

    it('should export BottomBlockContainer', () => {
      expect(Styled.BottomBlockContainer).toBeDefined();
    });

    it('should export BottomBlockContainerReskin', () => {
      expect(Styled.BottomBlockContainerReskin).toBeDefined();
    });

    it('should export TopBlockFooter', () => {
      expect(Styled.TopBlockFooter).toBeDefined();
    });

    it('should export DoneButton', () => {
      expect(Styled.DoneButton).toBeDefined();
    });

    it('should export TabsContainer', () => {
      expect(Styled.TabsContainer).toBeDefined();
    });

    it('should export FooterButtonContainer', () => {
      expect(Styled.FooterButtonContainer).toBeDefined();
    });

    it('should export MemberListContainer', () => {
      expect(Styled.MemberListContainer).toBeDefined();
    });

    it('should export ShareesListContainer', () => {
      expect(Styled.ShareesListContainer).toBeDefined();
    });

    it('should export SwitchWrapper', () => {
      expect(Styled.SwitchWrapper).toBeDefined();
    });

    it('should export MemberSection', () => {
      expect(Styled.MemberSection).toBeDefined();
    });

    it('should export MemberSectionText', () => {
      expect(Styled.MemberSectionText).toBeDefined();
    });

    it('should export MemberSectionOrg', () => {
      expect(Styled.MemberSectionOrg).toBeDefined();
    });
  });
});

