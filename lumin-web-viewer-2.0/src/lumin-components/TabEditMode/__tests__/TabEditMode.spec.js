import React from 'react';
import { shallow } from 'enzyme';
import TabEditMode from '../TabEditMode';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    search: '?action=merge'
  }),
}));

describe('<TabEditMode />', () => {
  it('snapshot render', () => {
    const wrapper = shallow(<TabEditMode />);
    expect(wrapper).toMatchSnapshot();
  });
});