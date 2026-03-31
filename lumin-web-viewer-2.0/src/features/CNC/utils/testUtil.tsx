import { render, RenderOptions } from '@testing-library/react';
import { KiwiProvider } from 'lumin-ui/kiwi-ui';
import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';

import { store } from 'store';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <KiwiProvider>
    <Provider store={store}>{children}</Provider>
  </KiwiProvider>
);

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
