import { environment } from '@/configs/environment';

export const jsonStringify = (data: any) => (environment.isDevelopment ? JSON.stringify(data, null, 4) : JSON.stringify(data));
