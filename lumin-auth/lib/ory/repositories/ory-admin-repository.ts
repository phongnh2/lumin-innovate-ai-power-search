import { environment } from '@/configs/environment';
import sanitizedAxiosInstance from '@/lib/exceptions/sanitizedAxios';

import { OryRepository, TOryConstructorType } from './ory-repository';

export class OryAdminRepository<TRepository> extends OryRepository<TRepository> {
  constructor(ConstructType: TOryConstructorType<TRepository>) {
    super(
      ConstructType,
      {
        baseOptions: {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${environment.internal.ory.adminApiKey}`
          }
        }
      },
      sanitizedAxiosInstance
    );
  }
}
