/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

@Injectable()
export class OpenSearchSerivce {
  private readonly openSearchClient: Client;

  constructor(
    private readonly environmentService : EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {
    this.openSearchClient = new Client({
      node: this.environmentService.getByKey(EnvConstants.ELASTIC_SEARCH_URL),
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  search(params: Record<string, unknown>, source?: string) {
    if (source) {
      this.loggerService.debug('Call to OpenSearch', {
        context: 'OpenSearchSerivce.search',
        extraInfo: { source },
      });
    }
    return this.openSearchClient.search(params);
  }

  deleteByQuery(params: { index: string, refresh?: boolean, body: Record<string, unknown> }) {
    return this.openSearchClient.deleteByQuery(params);
  }

  exists(index: string) {
    return this.openSearchClient.indices.exists({ index });
  }

  count(params: Record<string, unknown>) {
    return this.openSearchClient.count(params);
  }

  index(params: { index: string, body: Record<string, unknown> }): Promise<{
    body: Record<string, unknown>,
    statusCode: unknown,
  }> {
    return new Promise((resolve, reject) => {
      this.openSearchClient.index(params, (error, result) => {
        if (error) {
          this.loggerService.error({
            context: 'OpenSearchSerivce.index',
            extraInfo: { result, body: params.body },
            error,
          });
          reject(error);
          return;
        }
        resolve({
          body: result.body,
          statusCode: result.statusCode,
        });
      });
    });
  }

  updateByQuery(params: { index: string, refresh?: boolean, body: Record<string, unknown> }) {
    return this.openSearchClient.updateByQuery(params);
  }

  createIndex(params: { index: string, body: Record<string, unknown> }) {
    return this.openSearchClient.indices.create(params);
  }

  clearScroll({ scrollId }: { scrollId: string[] | string }) {
    return this.openSearchClient.clearScroll({ scroll_id: scrollId });
  }

  scroll(params: { scrollId: string, scroll: string }) {
    return this.openSearchClient.scroll(params);
  }
}
