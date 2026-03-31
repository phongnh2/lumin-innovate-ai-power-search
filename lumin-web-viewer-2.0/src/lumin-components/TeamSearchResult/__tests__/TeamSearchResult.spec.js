import React from 'react';
import { shallow } from 'enzyme';
import TeamSearchResult from '../TeamSearchResult';

describe('<TeamSearchResult />', () => {
  it('snapshot render', () => {
    const props = {
      searchText: 'test',
      teams: [
        {
          name: 'test',
          owner: {
            _id: '123123'
          }
        }
      ],
      currentUser: {
        _id: '123123'
      },
      currentDocument: {},
      handleMoveFile: jest.fn(),
    };
    const wrapper = shallow(<TeamSearchResult {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});