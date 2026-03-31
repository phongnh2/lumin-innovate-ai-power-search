import { ComponentType } from 'react';

type WithDropDocPopupConsumerProps = {
  disabled?: boolean;
  folder?: unknown;
};

type ExtendedWithDropDocPopupConsumerProps = {
  folderId: string;
  disabled: boolean;
  onFilesPicked: (files: File[], uploadFrom?: string) => Promise<void>;
  onDropStateChanged: (isHover: boolean) => void;
};

declare function withDropDocPopupConsumer<P>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof ExtendedWithDropDocPopupConsumerProps> & WithDropDocPopupConsumerProps>;

export default withDropDocPopupConsumer;
