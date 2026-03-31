import { Configuration, ConfigurationParameters } from '@ory/client';
import { AxiosInstance } from 'axios';

import { environment } from '@/configs/environment';

export type TOryConstructorType<TRepository> = new (conf: Configuration, basePath?: string, axios?: AxiosInstance) => TRepository;

export class OryRepository<TRepository> {
  protected _repository: TRepository;

  constructor(ConstructType: TOryConstructorType<TRepository>, config?: ConfigurationParameters, axios?: AxiosInstance) {
    this._repository = new ConstructType(
      new Configuration({
        basePath: environment.public.host.kratosUrl,
        baseOptions: {
          withCredentials: true
        },
        ...config
      }),
      undefined,
      axios
    );
  }
}
