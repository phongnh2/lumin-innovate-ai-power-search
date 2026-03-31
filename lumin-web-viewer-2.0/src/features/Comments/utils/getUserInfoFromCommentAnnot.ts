import validator from 'utils/validator';

import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';

import { IUser } from 'interfaces/user/user.interface';

interface IUserInfo {
  avatarRemoteId: string;
  name: string;
}

const DEFAULT_USER: IUserInfo = {
  avatarRemoteId: '',
  name: '',
};

const getUserInfoFromAnnotCustomData = (annotation: Core.Annotations.Annotation): IUserInfo => {
  const avatarSource = annotation.getCustomData(CUSTOM_DATA_COMMENT.AVATAR_SOURCE.key);
  if (!avatarSource) {
    return null;
  }

  try {
    const { avatarRemoteId, name } = JSON.parse(avatarSource) as {
      avatarRemoteId: string;
      name: string;
    };

    return {
      avatarRemoteId,
      name,
    };
  } catch {
    return null;
  }
};

export const getUserInfoFromCommentAnnot = ({
  annotation,
  currentUser,
}: {
  annotation: Core.Annotations.Annotation | string;
  currentUser: IUser;
}) => {
  if (!annotation) return DEFAULT_USER;
  const commentAuthor = annotation instanceof Core.Annotations.Annotation ? annotation.Author : annotation;
  if (!commentAuthor || commentAuthor === 'Anonymous') {
    return DEFAULT_USER;
  }

  if (!validator.isEmail(commentAuthor)) {
    return {
      avatarRemoteId: '',
      name: commentAuthor,
    };
  }

  if (currentUser?.email === commentAuthor) {
    return {
      avatarRemoteId: currentUser.avatarRemoteId,
      name: currentUser.name,
    };
  }

  if (annotation instanceof Core.Annotations.Annotation) {
    const customDataInfo = getUserInfoFromAnnotCustomData(annotation);
    if (customDataInfo) {
      return customDataInfo;
    }
  }

  if (!currentUser) {
    return DEFAULT_USER;
  }

  return {
    avatarRemoteId: '',
    name: commentAuthor,
  };
};
