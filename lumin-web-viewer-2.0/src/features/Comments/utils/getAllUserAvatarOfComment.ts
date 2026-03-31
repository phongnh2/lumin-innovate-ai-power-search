import { isEqual, uniqWith } from 'lodash';

import { IUser } from 'interfaces/user/user.interface';

import { getUserInfoFromCommentAnnot } from './getUserInfoFromCommentAnnot';

export const getAllUserAvatarsOfComment = (annotation: Core.Annotations.StickyAnnotation, currentUser: IUser) => {
  const replies = annotation.getReplies();
  const avatars = [annotation, ...replies].map((annot) => {
    const { avatarRemoteId, name } = getUserInfoFromCommentAnnot({
      annotation: annot as Core.Annotations.StickyAnnotation,
      currentUser,
    });
    return {
      avatarRemoteId,
      name,
    };
  });

  return uniqWith(avatars, isEqual) as Array<{ avatarRemoteId: string; name: string }>;
};
