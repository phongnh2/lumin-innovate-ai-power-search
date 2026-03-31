import { useParams } from 'react-router';

export const useIsSystemFile = () => {
  const params = useParams<{ documentId: string }>();
  const isSystemFile = params.documentId?.startsWith('system');
  return { isSystemFile };
};
