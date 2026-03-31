import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

export const useEnabledFormFieldDetection = () => {
  const currentUser = useGetCurrentUser();

  return {
    enabledFormFieldDetection: !!currentUser,
  };
};
