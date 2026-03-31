import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';

import actions from 'actions';

import { FolderServices } from 'services';

export function useGetFolderDetail(folderType) {
  const dispatch = useDispatch();
  const { folderId } = useParams();
  const folderServices = new FolderServices(folderType);
  const [folderDetail, setFolderDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFolderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const folderData = await folderServices.getDetail(folderId);
      setFolderDetail(folderData);
      dispatch(actions.setCurrentFolder(folderData));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderDetail();

    return () => {
      dispatch(actions.setCurrentFolder(null));
    };
  }, [folderId]);

  return {
    error,
    loading,
    folderDetail,
    retry: fetchFolderDetail,
    update: setFolderDetail,
  };
}
