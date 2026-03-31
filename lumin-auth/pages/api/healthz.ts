import type { NextApiRequest, NextApiResponse } from 'next';

import { environment } from '@/configs/environment';

/*
Swagger documentation for this API is located in:
 - docs/swagger/paths/health-check-path.yaml
*/
export default function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  const { method } = req;
  if (method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  res.status(200).send(environment.public.common.version);
}
