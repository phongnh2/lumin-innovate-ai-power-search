import React from 'react';
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createStore } from 'src/redux/mockStore';
import initialState from 'src/redux/initialState';
import AutoMockedApollo from 'src/apollo/mockApollo';
import { StoreProvider } from 'helpers/jestTesting';

import MemberItem from '../MemberItem';

const { matchMedia } = window
beforeAll(() => {
  delete window.matchMedia;
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});

afterAll(() => {
  window.matchMedia = matchMedia
});

const store = createStore({
  ...initialState,
});

const setup = (props) => {
  const instance = render(
    <AutoMockedApollo>
      <StoreProvider>
        <MemberItem {...props} />
      </StoreProvider>
    </AutoMockedApollo>,
  );
  return {instance};
};
describe('<MemberItem />', () => {

  it('case 1: should render', () => {
    const { instance } = setup({
      rightElement: <></>
    });
    expect(instance).toMatchSnapshot();
  });

  it('case 2: should render with more spacing', () => {
    const user = userEvent.setup()
    const { instance } = setup({
      rightElement: <></>,
      moreRightElement: true,
      user: {
        name: 'luminpdf',
        role: 'MEMBER',
      },
      size: 'large'
    });
    user.click(instance.container.getElementsByClassName('.MemberItem'));
    expect(instance).toMatchSnapshot();
  });

  it('case 3: should render with no right element', () => {
    const { instance } = setup({
      user: {
        name: 'luminpdf',
        role: 'ORGANIZATION_ADMIN'
      },
      size: 'large'
    });
    expect(instance).toMatchSnapshot();
  });
});
