import React from 'react';

export interface PaymentInfoData {
  nextPlanRemoteId?: string;
  nextProductId?: string;
  [key: string]: unknown;
}

export interface PaymentInfoState {
  data: PaymentInfoData;
  loading: boolean;
}

export interface PaymentInfoContextValue {
  nextPlanRemoteId?: string;
  nextProductId?: string;
  loading: boolean;
  updateState: (newData: Partial<PaymentInfoState>) => void;
  triggerEvent: ({ callback, params }: { callback: () => void; params: Record<string, unknown> }) => void;
}

export const PaymentInfoContext: React.Context<PaymentInfoContextValue>;

export default function withGetPaymentInfo<T>(Component: React.ComponentType<T>): (props: T) => JSX.Element;
