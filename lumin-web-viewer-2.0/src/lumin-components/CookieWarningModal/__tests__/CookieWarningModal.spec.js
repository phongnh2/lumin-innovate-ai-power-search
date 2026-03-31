import React from 'react';
import { setupMountProvider } from 'helpers/jestTesting'
import CookieWarningModal from '../CookieWarningModal';
import Context from '../Context';

describe('<CookieWarningModal />', () => {
  let instance = null;
  const setCookieModalVisible = jest.fn();
  beforeEach(() => {
    instance = setupMountProvider(
      <Context.Provider value={{ setCookieModalVisible, isVisible: true }}>
        <CookieWarningModal />
      </Context.Provider>
    )
  })
  it('should match snapshot', () => {
    expect(instance).toMatchSnapshot();
  });

  it('should hide this modal', () => {
    instance.find('button').simulate('click');
    expect(setCookieModalVisible).toBeCalled();
    expect(setCookieModalVisible).toBeCalledWith(false);
  });
});