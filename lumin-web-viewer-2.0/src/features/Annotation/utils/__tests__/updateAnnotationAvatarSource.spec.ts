import { getUserInfoFromCommentAnnot } from 'features/Comments/utils/getUserInfoFromCommentAnnot';
import { updateAnnotationAvatarSource } from '../updateAnnotationAvatarSource';
import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';

jest.mock('features/Comments/utils/getUserInfoFromCommentAnnot', () => ({
  getUserInfoFromCommentAnnot: jest.fn(),
}));

class MockAnnotation {
  setCustomData = jest.fn();
}
class MockWidgetAnnotation extends MockAnnotation {}
class MockTextWidgetAnnotation extends MockWidgetAnnotation {}
class MockCheckButtonWidgetAnnotation extends MockWidgetAnnotation {}
class MockRadioButtonWidgetAnnotation extends MockWidgetAnnotation {}
class MockStickyAnnotation extends MockAnnotation {
  Color: any;
  constructor() {
    super();
    this.Color = {
      toHexString: jest.fn().mockReturnValue('#000000'),
    };
  }
}
class MockColor {
  constructor(public r: number, public g: number, public b: number, public a: number) {}
}

beforeAll(() => {
  window.Core = {
    Annotations: {
      TextWidgetAnnotation: MockTextWidgetAnnotation,
      CheckButtonWidgetAnnotation: MockCheckButtonWidgetAnnotation,
      RadioButtonWidgetAnnotation: MockRadioButtonWidgetAnnotation,
      StickyAnnotation: MockStickyAnnotation,
      Color: MockColor,
    },
  } as any;
});

describe('updateAnnotationAvatarSource', () => {
  const mockUser = { id: 'user1' } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return annotation as-is if it is a TextWidgetAnnotation', () => {
    const annot = new MockTextWidgetAnnotation();
    const result = updateAnnotationAvatarSource({ annotation: annot as any, currentUser: mockUser });
    expect(result).toBe(annot);
    expect(annot.setCustomData).not.toHaveBeenCalled();
  });

  it('should return annotation as-is if it is a CheckButtonWidgetAnnotation', () => {
    const annot = new MockCheckButtonWidgetAnnotation();
    const result = updateAnnotationAvatarSource({ annotation: annot as any, currentUser: mockUser });
    expect(result).toBe(annot);
    expect(annot.setCustomData).not.toHaveBeenCalled();
  });

  it('should change StickyAnnotation color if it is white', () => {
    const annot = new MockStickyAnnotation();
    annot.Color.toHexString.mockReturnValue('#FFFFFF');
    (getUserInfoFromCommentAnnot as jest.Mock).mockReturnValue({
      avatarRemoteId: 'remote-1',
      name: 'User 1',
    });

    updateAnnotationAvatarSource({ annotation: annot as any, currentUser: mockUser });

    expect(annot.Color).toBeInstanceOf(MockColor);
    expect((annot.Color as any).r).toBe(255);
    expect((annot.Color as any).g).toBe(230);
  });

  it('should set custom data for avatar source on valid annotations', () => {
    const annot = new MockAnnotation();
    (getUserInfoFromCommentAnnot as jest.Mock).mockReturnValue({
      avatarRemoteId: 'remote-1',
      name: 'User 1',
    });

    updateAnnotationAvatarSource({ annotation: annot as any, currentUser: mockUser });

    expect(getUserInfoFromCommentAnnot).toHaveBeenCalledWith({
      annotation: annot,
      currentUser: mockUser,
    });
    expect(annot.setCustomData).toHaveBeenCalledWith(
      CUSTOM_DATA_COMMENT.AVATAR_SOURCE.key,
      JSON.stringify({ avatarRemoteId: 'remote-1', name: 'User 1' })
    );
  });
});