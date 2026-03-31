import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useGetCurrentOrganization } from 'hooks';

import lastAccessOrgs from 'utils/lastAccessOrgs';

import { useChatbotStore } from './useChatbotStore';
import { clearMessages, setChatSessionId } from '../slices';

const useResetChatSession = () => {
  const currentOrganization = useGetCurrentOrganization();
  const dispatch = useDispatch();
  const { setIsVisible, setIsClosedByUser } = useChatbotStore();

  useEffect(() => {
    dispatch(clearMessages());
    dispatch(setChatSessionId(null));
    setIsVisible(false);
    const lastAccessedOrgUrl = lastAccessOrgs.getOrgUrlList()[0] || '';
    if (currentOrganization && currentOrganization?.url !== lastAccessedOrgUrl) {
      setIsClosedByUser(false);
    }
  }, [currentOrganization?._id]);
};

export default useResetChatSession;
