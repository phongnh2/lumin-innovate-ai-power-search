import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { renderWithRedux } from 'utils/test-utils';
import OrgMemberSegmentTab from '../OrgMemberSegmentTab';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useMatch: () => ({ url: '/viewer/614f4c4759a4816804cfd542' }),
}));

describe('<OrgMemberSegmentTab />', () => {
  const history = createMemoryHistory();
  const setup = (props) => renderWithRedux(
    <Router history={history}>
      <OrgMemberSegmentTab {...props} />
    </Router>,
    { initialState: {} },
  );

  it('case 1: render page', () => {
    const { instance } = setup();
    instance.find('.OrgMemberSegmentTab__container').first().simulate('click');
    expect(instance).toMatchSnapshot();
  });
});
