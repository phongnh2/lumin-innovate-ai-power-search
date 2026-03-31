/* eslint-disable */
import React from 'react';
import { shallow, mount } from 'enzyme';
import TextField from '@mui/material/TextField';
import { Provider } from 'react-redux';

import { createStore } from 'src/redux/mockStore';
import initialState from 'src/redux/initialState';

import AddShareMemberInput from '../AddShareMemberInput';

const store = createStore({
  ...initialState,
});

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
});

describe('AddShareMemberInput', () => {
  const classes = { input: '' };
  it('snapshot renders', () => {
    const component = mount(
      <Provider store={store}>
        <AddShareMemberInput classes={classes} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });

  describe('<AddShareMemberInput />', () => {
    let wrapper;
    let props;
    beforeEach(() => {
      props = {
        handleAddUserTag: jest.fn(),
        setShareMessage: jest.fn(),
        userTags: [{ email: 'tuannha@dgroup.co', name: 'tuan' }],
        handleChangeUserTagPermission: jest.fn(),
        handleRemoveUserTag: jest.fn(),
        classes: { input: '' },
        listMemberInfo: [
          {
            _id: 1,
            email: 'tuannha@dgroup.co',
          },
        ],
        members: [
          {
            _id: 1,
            email: 'tuannha@dgroup.co',
          },
          {
            _id: 2,
            email: 'tientm@dgroup.co',
          },
        ],
        client: {
          query: jest.fn(),
        },
      };
    });

    it('should hide Share message', () => {
      wrapper = mount(
        <Provider store={store}>
          <AddShareMemberInput classes={classes} {...props} />
        </Provider>
      );
      wrapper
        .find('#downshift-multiple-input')
        .hostNodes()
        .simulate('change', { target: { value: 'luminpdf@gmail.com' } });
      expect(props.setShareMessage).toBeCalled();
    });

    it('handleRemoveUserTag will be trigger when pressing Backspace', () => {
      wrapper = mount(
        <Provider store={store}>
          <AddShareMemberInput classes={classes} {...props} />
        </Provider>
      );
      const instance = wrapper.instance();
      const input = wrapper.find('#downshift-multiple-input').hostNodes();
      input.simulate('keydown', { key: 'Backspace' });
      expect(props.handleRemoveUserTag).toBeCalled();
    });
  });
});