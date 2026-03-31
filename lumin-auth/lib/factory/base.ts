import { AWSAnalyticsProps } from '@/interfaces/analytics';

export interface BaseAnalytics<T, U> {
  getInstance(): Promise<T | undefined> | T;
  record(params: U): void;
  record(params: AWSAnalyticsProps): void;
}
