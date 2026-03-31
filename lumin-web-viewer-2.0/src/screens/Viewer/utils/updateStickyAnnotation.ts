import { getUserInfoFromCommentAnnot } from 'features/Comments/utils/getUserInfoFromCommentAnnot';

import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';

import { IUser } from 'interfaces/user/user.interface';

export const updateStickyAnnotation = ({
  annotation,
  currentUser,
}: {
  annotation: Core.Annotations.Annotation;
  currentUser: IUser;
}) => {
  if (annotation instanceof window.Core.Annotations.StickyAnnotation) {
    if (annotation.Color.toHexString() === '#FFFFFF') {
      const newColor = new window.Core.Annotations.Color(255, 230, 162, 1);
      annotation.Color = newColor;
    }
    const { avatarRemoteId, name } = getUserInfoFromCommentAnnot({
      annotation,
      currentUser,
    });
    annotation.setCustomData(
      CUSTOM_DATA_COMMENT.AVATAR_SOURCE.key,
      JSON.stringify({
        avatarRemoteId,
        name,
      })
    );
  }
  return annotation;
};
