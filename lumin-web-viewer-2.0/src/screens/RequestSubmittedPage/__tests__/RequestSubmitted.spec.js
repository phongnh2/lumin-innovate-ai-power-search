/* eslint-disable */
import React from 'react';
import { MemoryRouter } from 'react-router';
import { setupMountProvider } from 'helpers/jestTesting';
import RequestSubmitted from '../RequestSubmitted';

describe('<RequestSubmitted />', () => {
  it('RequestSubmitted', () => {
    const  wrapper = setupMountProvider(<MemoryRouter><RequestSubmitted /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
  });
});
