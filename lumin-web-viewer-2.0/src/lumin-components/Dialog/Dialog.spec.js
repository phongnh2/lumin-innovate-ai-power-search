import React from 'react';
import * as Redux from 'react-redux';
import { setupMountProvider } from 'helpers/jestTesting';
import Dialog from './Dialog';

const spyOnUseSelector = jest.spyOn(Redux, 'useSelector');
const spyOnUseDispatch = jest.spyOn(Redux, 'useDispatch');
const mockDispatch = jest.fn();

spyOnUseSelector.mockReturnValue([]);
spyOnUseDispatch.mockReturnValue(mockDispatch);

describe('<Dialog />', () => {
  let wrapper = null;
  beforeEach(() => {
    wrapper = setupMountProvider(
      <Dialog />,
    );
  });
  it('shallow render', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('snapshot render', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
