import selectors from 'selectors';
import { formBuilderSelectors } from 'features/DocumentFormBuild/slices';
import { readAloudSelectors } from 'features/ReadAloud/slices';
import { getUserInfoFromCommentAnnot } from 'features/Comments/utils';
import { updateAnnotationAvatarSourceOnAdded } from '../updateAnnotationAvatarSourceOnAdded';
import { TOOLS_NAME } from 'constants/toolsName';
import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';

jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock('selectors', () => ({
  getActiveToolName: jest.fn(),
  isInContentEditMode: jest.fn(),
  getCurrentUser: jest.fn(),
}));

jest.mock('features/Comments/utils', () => ({
  getUserInfoFromCommentAnnot: jest.fn(),
}));

jest.mock('features/DocumentFormBuild/slices', () => ({
  formBuilderSelectors: {
    isInFormBuildMode: jest.fn(),
  },
}));

jest.mock('features/ReadAloud/slices', () => ({
  readAloudSelectors: {
    isInReadAloudMode: jest.fn(),
  },
}));

describe('updateAnnotationAvatarSourceOnAdded', () => {
  const mockAnnotation = {
    setCustomData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (selectors.getActiveToolName as jest.Mock).mockReturnValue('pan');
    (selectors.isInContentEditMode as jest.Mock).mockReturnValue(false);
    (readAloudSelectors.isInReadAloudMode as jest.Mock).mockReturnValue(false);
    (formBuilderSelectors.isInFormBuildMode as jest.Mock).mockReturnValue(false);
    (selectors.getCurrentUser as jest.Mock).mockReturnValue({
      avatarRemoteId: 'avatar-123',
      name: 'John Doe',
    });
  });

  it('should should not update annotations if in Redaction mode', () => {
    (selectors.getActiveToolName as jest.Mock).mockReturnValue(TOOLS_NAME.REDACTION);
    
    updateAnnotationAvatarSourceOnAdded([mockAnnotation as any]);
    
    expect(mockAnnotation.setCustomData).not.toHaveBeenCalled();
  });

  it('should should not update annotations if in Content Edit mode', () => {
    (selectors.isInContentEditMode as jest.Mock).mockReturnValue(true);
    
    updateAnnotationAvatarSourceOnAdded([mockAnnotation as any]);
    
    expect(mockAnnotation.setCustomData).not.toHaveBeenCalled();
  });

  it('should should not update annotations if in Read Aloud mode', () => {
    (readAloudSelectors.isInReadAloudMode as jest.Mock).mockReturnValue(true);
    
    updateAnnotationAvatarSourceOnAdded([mockAnnotation as any]);
    
    expect(mockAnnotation.setCustomData).not.toHaveBeenCalled();
  });

  it('should should not update annotations if in Form Builder mode', () => {
    (formBuilderSelectors.isInFormBuildMode as jest.Mock).mockReturnValue(true);
    
    updateAnnotationAvatarSourceOnAdded([mockAnnotation as any]);
    
    expect(mockAnnotation.setCustomData).not.toHaveBeenCalled();
  });

  it('should update annotation with current user info', () => {
    updateAnnotationAvatarSourceOnAdded([mockAnnotation as any]);

    expect(mockAnnotation.setCustomData).toHaveBeenCalledWith(
      CUSTOM_DATA_COMMENT.AVATAR_SOURCE.key,
      JSON.stringify({
        avatarRemoteId: 'avatar-123',
        name: 'John Doe',
      })
    );
  });

  it('should use fallback info if current user is not available', () => {
    (selectors.getCurrentUser as jest.Mock).mockReturnValue(null);
    (getUserInfoFromCommentAnnot as jest.Mock).mockReturnValue({
      avatarRemoteId: 'fallback-id',
      name: 'Fallback User',
    });

    updateAnnotationAvatarSourceOnAdded([mockAnnotation as any]);

    expect(getUserInfoFromCommentAnnot).toHaveBeenCalledWith({
      annotation: mockAnnotation,
      currentUser: null,
    });
    expect(mockAnnotation.setCustomData).toHaveBeenCalledWith(
      CUSTOM_DATA_COMMENT.AVATAR_SOURCE.key,
      JSON.stringify({
        avatarRemoteId: 'fallback-id',
        name: 'Fallback User',
      })
    );
  });
});