/* eslint-disable */
import React from 'react';
import { shallow, mount } from 'enzyme';
import OpenForm from '../OpenForm';
jest.mock('services/graphServices/documentGraphServices', () => ({
  createPDFForm: jest
    .fn()
    .mockResolvedValue({ data: { createPDFForm: { documentId: '123123' } } }),
}));
describe('<OpenForm />', () => {
  const { location } = window;

  beforeAll(() => {
    delete window.location;
    window.location = { href: 'form-example' };
  });

  afterAll(() => {
    window.location = location;
    jest.clearAllMocks();
  });

  const props = {
    location: {
      search: 'test',
    },
    history: {
      push: jest.fn(),
    },
    openModal: jest.fn(),
  };

  it('render snapshot', () => {
    const wrapper = mount(<OpenForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  describe('user has logged in', () => {
    it('should be create  and open form', () => {
      localStorage.setItem('token', '123123');
      const wrapper = mount(<OpenForm {...props} />);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('user has not logged in', () => {
    it('should be create  and open form', () => {
      localStorage.removeItem('token');
      const wrapper = mount(<OpenForm {...props} />);
      expect(wrapper).toMatchSnapshot();
    });

  });
});