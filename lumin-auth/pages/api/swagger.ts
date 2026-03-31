import { NextApiRequest, NextApiResponse } from 'next';

import { getSwaggerSpec } from '../../lib/swagger';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }

  const spec = getSwaggerSpec();
  res.status(200).json(spec);
};

export default handler;
