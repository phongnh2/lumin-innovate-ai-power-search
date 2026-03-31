/* eslint-disable */
import React from 'react';

import { setupMountProvider } from 'helpers/jestTesting';
import PopperUpload from '../components/PopperUpload';

describe('<PopperUpload', () => {
  const props = {
    closePopper: jest.fn(),
    removeAvatar: jest.fn(),
    inputRef: {
      current: {
        click: jest.fn(),
      },
    },
  };

  it('snapshot render', () => {
    const { instance } = setupMountProvider(
      <PopperUpload {...props} />
    );
    expect(instance).toMatchSnapshot();
  });
});
