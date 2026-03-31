import { NextApiRequest } from 'next';

import { NetworkConstants } from '@/constants/common';

export const getIpAddress = (request: NextApiRequest): string => {
  return (request.headers[NetworkConstants.X_FORWARDED_FOR_HEADER] ||
    request.headers[NetworkConstants.CF_CONNECTING_IP] ||
    request.headers[NetworkConstants.TRUE_CLIENT_IP] ||
    NetworkConstants.DEFAULT_IP_ADDRESS) as string;
};
