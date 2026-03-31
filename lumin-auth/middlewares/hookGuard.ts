import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunction } from 'next-api-decorators';

export default async function middleware(request: NextApiRequest, _: NextApiResponse, next: NextFunction): Promise<void> {
  if (!request) {
    throw new Error('Authentication error');
  }

  const apiKey = process.env.LUMIN_KRATOS_HOOK_API_KEY as string;
  if ((request.headers as { authorization?: string }).authorization !== apiKey.trim()) {
    throw new Error('Authentication error');
  }
  return next();
}
