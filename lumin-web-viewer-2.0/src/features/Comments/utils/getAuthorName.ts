import mentionsManager from 'helpers/MentionsManager';

import { validator } from 'utils';

import { IUser } from 'interfaces/user/user.interface';

export const getAuthorName = ({
  annotation,
  currentUser,
  authorEmail,
}: {
  annotation?: Core.Annotations.Annotation;
  currentUser: IUser;
  authorEmail: string;
}): string => {
  if (!annotation && authorEmail) return '';
  // We save user email as author name for annotation
  const author = authorEmail || annotation.Author || '';

  if (!validator.validateEmail(author)) {
    return author;
  }

  if (currentUser && author === currentUser.email) {
    return currentUser.name;
  }

  const userInformation = mentionsManager.getUserData() as IUser[];
  if (userInformation.some((user) => user.email === author)) {
    return userInformation.find((user) => user.email === author).name;
  }
  return author;
};
