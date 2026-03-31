import { environment } from '@/configs/environment';

export const storageUrl = (key: string): string => {
  const { region, s3ProfilesBucket } = environment.public.aws;
  return `https://${s3ProfilesBucket}.s3.${region}.amazonaws.com/${key}`;
};
