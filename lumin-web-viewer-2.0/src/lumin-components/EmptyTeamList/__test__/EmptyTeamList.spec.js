import React from 'react';
import { shallow } from 'enzyme';
import EmptyTeamList from '../EmptyTeamList';
import { StyledCreateButton } from '../EmptyTeamList.styled';

describe('<EmptyTeamList />', () => {
  it('snapshot render', () => {
    const wrapper = shallow(
      <EmptyTeamList />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should have plan', () => {
    const props = {
      location: {
        state: {
          fromPlan: true
        }
      },
      onCreateTeamClick: jest.fn()
    }
    const wrapper = shallow(
      <EmptyTeamList {...props} />,
    );
    wrapper.find(StyledCreateButton).simulate('click');
    expect(props.onCreateTeamClick).toHaveBeenCalledTimes(1);
  });

});
