import React from 'react';
import { shallow } from 'enzyme';
import { LIST_MEMBER_TO_SHOW, ROLE } from 'src/screens/Teams/TeamConstant';
import { mergeDeep } from 'utils/objectUtils';
import TeamMembersList from '../TeamMembersList';

function setup(props = {}) {
  const defaultProps = {
    currentUser: {
      _id: '123123'
    },
    team: {
      _id: '123123213',
      roleOfUser: ROLE.ADMIN,
    },
    setRefetchList: jest.fn(),
    searchText: '',
    listToShow: LIST_MEMBER_TO_SHOW.MEMBER
  };
 
  const mergedProps = mergeDeep(defaultProps, props)
  const wrapper = shallow( <TeamMembersList {...mergedProps} />);
  return { wrapper };
}

describe('<TeamMembersList />', () => {
  describe('CASE: LIST_TO_SHOW: MEMBER', () => {
    it('should render member list', () => {
      const { wrapper } = setup();
      wrapper.renderProp('children')({
        data: {
          memberships: []
        }
      });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render error', () => {
      const { wrapper } = setup();
      wrapper.renderProp('children')({
        error: {},
        data: {
          memberships: []
        }
      });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render empty', () => {
      const { wrapper } = setup();
      wrapper.renderProp('children')({ data: {} });
      expect(wrapper).toMatchSnapshot();
    });

    it('should render 1 items', () => {
      const { wrapper } = setup();
      wrapper.renderProp('children')({ data: { memberships: [{ user: { _id: '1' }}]} });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('case: LIST_TO_SHOW = PENDING_MEMBER', () => {
    it('should render skeleton', () => {
      const { wrapper } = setup({
        listToShow: LIST_MEMBER_TO_SHOW.PENDING_MEMBER
      });
      wrapper.renderProp('children')({
        loading: true,
        data: {
          memberships: [],
          pendingUsers: {
            members: [],
            total: 0
          }
        }
      });
      expect(wrapper).toMatchSnapshot();
    })

    it('should render pending list', () => {
      const { wrapper } = setup({
        listToShow: LIST_MEMBER_TO_SHOW.PENDING_MEMBER
      });
      wrapper.renderProp('children')({
        data: {
          memberships: [],
          pendingUsers: {
            members: [],
            total: 0
          }
        }
      });
      expect(wrapper).toMatchSnapshot();
    });
  })
});