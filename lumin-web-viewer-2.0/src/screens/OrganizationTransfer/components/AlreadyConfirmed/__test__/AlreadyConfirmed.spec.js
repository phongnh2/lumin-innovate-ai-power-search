import React from 'react';
import { MemoryRouter } from 'react-router';
import { ORGANIZATION_ROLES, ORGANIZATION_TEXT } from 'constants/organizationConstants';
import { setupMountProvider } from 'helpers/jestTesting';
import AlreadyConfirmed from '../AlreadyConfirmed';

const setup = (props = {}) => setupMountProvider(
  <MemoryRouter>
    <AlreadyConfirmed {...props} />
  </MemoryRouter>
);

describe('<AlreadyConfirmed />', () => {
  it('snapshot render', () => {
    const wrapper = setup({
      currentOrganization: {
        data: {
          userRole: ORGANIZATION_ROLES.MEMBER
        }
      }
    })
    expect(wrapper).toMatchSnapshot();
  });

  it(`snapshot render with ${ORGANIZATION_TEXT} Admin`, () => {
    const wrapper = setup({
      currentOrganization: {
        data: {
          userRole: ORGANIZATION_ROLES.ORGANIZATION_ADMIN
        }
      }
    })
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render with empty organization', () => {
    const wrapper = setup()
    expect(wrapper).toMatchSnapshot();
  });

});