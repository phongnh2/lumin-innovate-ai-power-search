import React from 'react';
import { shallow } from 'enzyme';
import TeamSearchItem from '../TeamSearchItem';

function setup(props = {}) {
  const defaultProps = {
    team: {
      avatarRemoteId: 'remote_id',
      name: 'test',
    },
    isOwner: true,
    currentDocument: {},
    handleMoveFile: jest.fn(),
  };
  const mergedProps = {
    ...defaultProps,
    ...props,
  };
  const wrapper = shallow(<TeamSearchItem {...mergedProps} />);
  return { wrapper, props: mergedProps };
}

describe('<TeamSearchItem />', () => {
  it('snapshot render', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });
  describe('simulate event', () => {
    it('should show button with class TeamSearchItem__button', () => {
      const { wrapper } = setup();
      wrapper.find('.TeamSearchItem').simulate('mouseenter');
      expect(wrapper.find('.TeamSearchItem__button')).toHaveLength(1);
    });

    it('should hide button with class TeamSearchItem__button', () => {
      const { wrapper } = setup();
      const teamSearchItem = wrapper.find('.TeamSearchItem');
      teamSearchItem.simulate('mouseenter');
      teamSearchItem.simulate('mouseleave');
      expect(wrapper.find('.TeamSearchItem__button')).toHaveLength(0);
    });

    describe('click on button with class TeamSearchItem__button', () => {
      it('should call handleMoveFile', () => {
        const handleMoveFile = jest.fn();
        const { wrapper } = setup({ handleMoveFile });
        wrapper.find('.TeamSearchItem').simulate('mouseenter');
        wrapper.find('.TeamSearchItem__button').simulate('click');
        expect(handleMoveFile).toBeCalled();
      });

      it('click button case cookiesDisabled = false', () => {
        const handleMoveFile = jest.fn();
        const { wrapper } = setup({ handleMoveFile, currentDocument: { service: 'google' } });
        wrapper.find('.TeamSearchItem').simulate('mouseenter');
        wrapper.find('.TeamSearchItem__button').simulate('click');
        expect(handleMoveFile).toBeCalled();
      });
    });
  });
});