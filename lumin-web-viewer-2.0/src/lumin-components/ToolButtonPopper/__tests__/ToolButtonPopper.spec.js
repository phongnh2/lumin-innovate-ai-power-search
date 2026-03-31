/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import ToolButtonPopper from '../ToolButtonPopper';

jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockReturnValue([]),
  useDispatch: jest.fn(),
}));

describe('<ToolButtonPopper />', () => {
  describe('snapshot render', () => {
    it('should render signin require popper', () => {
      const props = {
        toolName: 'AnnotationCreateFreeHand',
        currentUser: {
          _id: '123123',
        },
        currentDocument: {
          roleOfDocument: 'VIEWER',
          documentStatus: {
            isPremium: true,
          },
          shareSetting: {
            permission: 'VIEWER'
          }
        }
      };

      const wrapper = shallow(<ToolButtonPopper {...props}/>);
      expect(wrapper.find('.Premium__title').text()).toBe('viewer.requestPermissionUpModal.permissionRequired');
      expect(wrapper).toMatchSnapshot();
    });

    it('should render permission require popper', () => {
      const props = {
        toolName: 'AnnotationCreateFreeHand',
        currentUser: {
          _id: '123123',
        },
        currentDocument: {
          roleOfDocument: 'VIEWER',
          documentStatus: {
            isPremium: true,
          },
          shareSetting: {
            permission:'VIEWER'
          },
        }
      };
      const wrapper = shallow(<ToolButtonPopper {...props} />);
      expect(wrapper.find('.Premium__title').text()).toBe(
        'viewer.requestPermissionUpModal.permissionRequired'
      );
      expect(wrapper).toMatchSnapshot();
    });

    it('should render "Premium feature" popper', () => {
      window.localStorage.setItem('token', 'mocktoken');
      const props = {
        toolName: 'FormBuilder',
        currentDocument: {
          roleOfDocument: 'EDITOR',
          shareSetting: {
            permission:'VIEWER',
          },
          premiumToolsInfo:{
            formBuilder: false,
          },
        },
        currentUser: {
          payment: {
            type: 'FREE',
          },
        }
      };
      const wrapper = shallow(<ToolButtonPopper {...props} />);
      expect(wrapper.find('.Premium__title').text()).toBe('viewer.upgradeToAccess');
      expect(wrapper).toMatchSnapshot();
    });
  });
});
