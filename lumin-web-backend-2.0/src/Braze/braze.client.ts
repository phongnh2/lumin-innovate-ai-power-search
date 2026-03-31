import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

import { BrazeError } from './braze.error';
import { IBrazeCampaignTriggerPayload } from './braze.interface';

interface BrazeRequestConfig extends AxiosRequestConfig {
  metadata?: {
    context?: string;
  };
}

@Injectable()
export class BrazeClient implements OnModuleInit {
  private readonly headers: Record<string, string>;

  private readonly brazeRestUrl: string;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
  ) {
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.environmentService.getByKey(EnvConstants.BRAZE_API_KEY)}`,
    };
    this.brazeRestUrl = this.environmentService.getByKey(EnvConstants.BRAZE_REST_URL);
  }

  onModuleInit() {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    const axiosInstance = this.httpService.axiosRef;

    axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const config = error.config as BrazeRequestConfig;
        const requestUrl = error.config?.url || (error.request)?.responseURL || '';

        const isBrazeRequest = requestUrl.includes(this.brazeRestUrl) || config?.metadata?.context;

        if (!isBrazeRequest) {
          return Promise.reject(error);
        }

        const context = config?.metadata?.context || 'BrazeClient';

        const brazeError = BrazeError.fromAxiosError(error, context);
        this.handleError(brazeError);

        return Promise.reject(brazeError);
      },
    );
  }

  private handleError(error: BrazeError): void {
    this.loggerService.error({
      extraInfo: {
        url: error.url,
        method: error.method,
        responseData: error.responseData,
      },
      context: error.context,
      error: error.message,
      errorCode: error.errorCode,
      message: error.message,
      stack: error.stack,
    });
  }

  private async post<T = any>(endpoint: string, payload: any): Promise<T> {
    const config: BrazeRequestConfig = {
      headers: this.headers,
      metadata: {
        context: `BrazeClient.post(${endpoint})`,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post<T>(`${this.brazeRestUrl}${endpoint}`, payload, config),
    );
    return response.data;
  }

  async trackUsers(payload: any): Promise<void> {
    await this.post('/users/track', payload);
  }

  async deleteUsers(externalIds: string[]): Promise<void> {
    const payload = {
      external_ids: externalIds,
    };
    await this.post('/users/delete', payload);
  }

  async triggerCampaign(payload: IBrazeCampaignTriggerPayload): Promise<void> {
    await this.post('/campaigns/trigger/send', payload);
  }
}
