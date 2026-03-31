import React from 'react';
import { shallow, mount } from 'enzyme';
import { STATUS } from 'constants/plan';
import MaterialSelect from '../MaterialSelect';

describe('<MaterialSelect />', () => {
  const props = {
    onSelected: jest.fn(),
    items: [{
      avatarRemoteId: '',
      billingEmail: 'tuannha@dgroup.co',
      disabled: false,
      endTrial: null,
      members: [],
      note: 'note',
      roleOfUser: 'admin',
      name: 'user',
      owner: { _id: '123', __typename: 'User' },
      payment: {
        type: 'FREE', period: null, status: null, quantity: null, currency: null,
      },
      remainingPlan: { currency: null, balance: null, __typename: 'RemainingPlan' },
      selected: true,
      totalMembers: 1,
      value: '123',
      __typename: 'Team',
      _id: '123',
      class: '',
    }],
    containerClasses: '',
    inputClasses: '',
    value: '',
    blankMessage: '',
    disabled: false,
  };

  it('MaterialSelect render', () => {
    const wrapper = mount(<MaterialSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('MaterialSelect Item disabled', () => {
    const newProps = {
      ...props,
      items: [{
        disabled: true,
      }],
    };
    const wrapper = mount(<MaterialSelect {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('MaterialSelect currentItem', () => {
    const newProps = {
      ...props,
      value: '123',
    };
    const wrapper = mount(<MaterialSelect {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('MaterialSelect disabled', () => {
    const newProps = {
      ...props,
      disabled: true,
    };
    const wrapper = mount(<MaterialSelect {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('MaterialSelect Item empty', () => {
    const newProps = {
      ...props,
      items: [],
    };
    const wrapper = mount(<MaterialSelect {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});