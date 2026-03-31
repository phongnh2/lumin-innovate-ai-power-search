import { useApiAppContext } from 'features/DeveloperApi/hooks/useApiAppContext';
import { OAuth2Client } from 'features/DeveloperApi/interfaces';

export const useEditOAuth2Client = () => {
  const { setAppScreenState } = useApiAppContext();

  const handleEditOAuth2Client = (editOAuth2Client: Partial<OAuth2Client>) => {
    setAppScreenState({ type: 'editting', payload: editOAuth2Client });
  };

  return {
    handleEditOAuth2Client,
  };
};
