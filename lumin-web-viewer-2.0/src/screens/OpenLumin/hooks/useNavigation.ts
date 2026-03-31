import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { kratosService } from 'services/oryServices';

import { getLanguage } from 'utils/getLanguage';

import { LANGUAGES } from 'constants/language';
import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';

import { DocumentSystemFile } from 'interfaces/document/document.interface';

type UseNavigationProps = {
  fileId: string;
};

export const useNavigation = ({ fileId }: UseNavigationProps) => {
  const isCompletedGettingUserData = useSelector(selectors.getIsCompletedGettingUserData);
  const currentUser = useGetCurrentUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOpenFile = useCallback(
    async (url: string) => {
      const language = getLanguage();
      const systemFile = (await systemFileHandler.get(fileId)) as DocumentSystemFile;

      if (!systemFile?.ownerName) {
        await systemFileHandler.update(fileId, { ownerName: currentUser.name });
      }

      const targetUrl = language === LANGUAGES.EN ? url : `/${language}${url}`;

      if (language !== LANGUAGES.EN) {
        dispatch(actions.setLanguage(language));
      }

      navigate(targetUrl);
    },
    [fileId, currentUser?.name, navigate, dispatch]
  );

  const handleNavigation = useCallback(async () => {
    if (!isCompletedGettingUserData || !fileId) {
      return;
    }

    const url = `${Routers.VIEWER}/${fileId}`;

    if (currentUser?._id) {
      await handleOpenFile(url);
    } else {
      const language = getLanguage();
      const fullUrl = language === LANGUAGES.EN ? `${BASEURL}${url}` : `${BASEURL}/${language}${url}`;
      kratosService.signIn({ url: fullUrl });
    }
  }, [isCompletedGettingUserData, fileId, currentUser?._id, handleOpenFile]);

  return {
    handleOpenFile,
    handleNavigation,
  };
};
