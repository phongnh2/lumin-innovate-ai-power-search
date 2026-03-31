import { useTranslation } from 'react-i18next';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { IUser } from 'interfaces/user/user.interface';

import { formatDate, getUserInfoFromCommentAnnot } from '../utils';

export const useGetCommentInfo = ({
  annotation,
  currentUser,
}: {
  annotation: Core.Annotations.StickyAnnotation;
  currentUser: IUser;
}) => {
  const { t } = useTranslation();
  const { name, avatarRemoteId } = getUserInfoFromCommentAnnot({ annotation, currentUser });
  const noteDateFormat = useShallowSelector(selectors.getNoteDateFormat);

  return {
    name,
    avatarRemoteId,
    createdDate: annotation.DateCreated
      ? formatDate(annotation.DateCreated, noteDateFormat)
      : t('viewer.noteContent.noDate'),
  };
};
