/* eslint-disable */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { StoreProvider } from 'helpers/jestTesting';

import PopperLimitWrapper from '../PopperLimitWrapper';
const onClick = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-router'),
  useSelector: jest.fn().mockReturnValue([]),
  useDispatch: jest.fn(),
  connect: () => Component => Component,
}));

function setup(props) {
  const defaultProps = {
    children: <StoreProvider><MemoryRouter><ButtonMaterial>OK</ButtonMaterial></MemoryRouter></StoreProvider>,
    onClick,
    currentUser: null,
    currentDocument: {},
    icon: null,
    userTeams: [],
    match: {
      params: {
        documentId: '123123',
      },
    },
    themeMode: 'light',
  }
  const mergedProps = { ...defaultProps, ...props };
  const wrapper = shallow(<PopperLimitWrapper {...mergedProps} />).dive();
  const instance = mount(<PopperLimitWrapper {...mergedProps} />);
  return {
    wrapper,
    instance,
  }
}

describe('<PopperLimitWrapper />', () => {
  describe('snapshot render', () => {
    it('should match snapshot', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('simulate events', () => {
    it('should open modal', () => {
      const { wrapper } = setup();
      wrapper.find('span').first().simulate('click');
      expect(wrapper.state().isOpen).toBe(true);
    })

    it('should call click function prop', () => {
      const { wrapper } = setup({
        currentUser: {
          payment: {
            type: 'PREMIUM',
          }
        },
        currentDocument: {
          roleOfDocument: 'EDITOR',
          documentStatus: {
            isPremium: true,
          }
        }
      });
      wrapper.find('span').first().simulate('click');
      expect(onClick).toBeCalled();
    });

    it('should close modal', () => {
      const { wrapper } = setup();
      const instance = wrapper.instance();
      instance.handleClose();
      expect(wrapper.state().isOpen).toBe(false);
    });
  });
});