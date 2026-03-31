/* eslint-disable */
import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';
import AuthorizeRequest from '../AuthorizeRequest';
import { setupMountProvider } from 'helpers/jestTesting';

describe('<AuthorizeRequest />', () => {
  const props = {
    currentUser: {
      _id:'1234',
      name:'Tuan Nguyen',
      email: "tuananhnguyenhoang0410@gmail.com"
    },
    location: {
      search: '?docId=123456'
    },
    history: {
      push: jest.fn()
    },
  }
  it('AuthorizeRequest', () => {
    const  wrapper = setupMountProvider(<MemoryRouter><AuthorizeRequest {...props}/></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
  });
  it('AuthorizeRequest have login', () => {
    const newProps = {
      ...props,
      location: {
        search: ''
      },
    };
    window.localStorage.setItem('token', '123456');
    const  wrapper = setupMountProvider(<MemoryRouter><AuthorizeRequest {...newProps}/></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
  });
  it('AuthorizeRequest no docID', () => {
    const newProps = {
      ...props,
      location: {
        search: ''
      },
    }
    window.localStorage.removeItem('token');
    const  wrapper = setupMountProvider(<MemoryRouter><AuthorizeRequest {...newProps}/></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
  });
});