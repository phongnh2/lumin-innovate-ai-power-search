import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from "react-redux";
import { MemoryRouter } from 'react-router';
import { renderWithRedux, mockStore } from 'utils/test-utils';
import { organizationServices } from 'services';
import { ErrorCode } from 'constants/lumin-common';
import OrganizationTransfer from '../OrganizationTransfer';
import { ORG_TEXT } from 'constants/organizationConstants';

const store = mockStore();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    orgName: 'dsv',
  }),
  useLocation: () => ({
    search: '?token=abcd'
  }),
  useMatch: () => ({ url: `/${ORG_TEXT}/dsv`, params: { orgName: 'dsv' } }),
}));

const setup = (props = {}) => renderWithRedux(
  <Provider store={store}>
    <MemoryRouter>
      <OrganizationTransfer {...props} />
    </MemoryRouter>
  </Provider>
);

describe('<OrganizationTransfer />', () => {
  it('snapshot render', async() => {
    let wrapper;
    await act(async () => {
      jest.spyOn(organizationServices, 'confirmOrganizationAdminTransfer').mockResolvedValueOnce(true)
      wrapper = setup();
    })
    expect(wrapper).toBeTruthy();
  });

  it('case: ErrorCode.Common.FORBIDDEN', async() => {
    let wrapper;
    await act(async () => {
      jest.spyOn(organizationServices, 'confirmOrganizationAdminTransfer').mockRejectedValueOnce({
        graphQLErrors: [
          {
            extensions: {
              code: ErrorCode.Common.FORBIDDEN,
            },
          },
        ]
      })
      wrapper = setup();
    })
    expect(wrapper).toMatchSnapshot();
  })

  it('case: ErrorCode.Org.TRANSFER_ADMIN_TOKEN_EXPIRED', async() => {
    let wrapper;
    await act(async () => {
      jest.spyOn(organizationServices, 'confirmOrganizationAdminTransfer').mockRejectedValueOnce({
        graphQLErrors: [
          {
            extensions: {
              code: ErrorCode.Org.TRANSFER_ADMIN_TOKEN_EXPIRED,
            },
          },
        ]
      })
      wrapper = setup();
    })
    expect(wrapper).toMatchSnapshot();
  })

  it('case: ErrorCode.Org.TRANSFER_ADMIN_ALREADY_CONFIRM', async() => {
    let wrapper;
    await act(async () => {
      jest.spyOn(organizationServices, 'confirmOrganizationAdminTransfer').mockRejectedValueOnce({
        graphQLErrors: [
          {
            extensions: {
              code: ErrorCode.Org.TRANSFER_ADMIN_ALREADY_CONFIRM,
            },
          },
        ]
      })
      wrapper = setup();
    })
    expect(wrapper).toMatchSnapshot();
  })

  it('case: ErrorCode.Common.BAD_REQUEST', async() => {
    let wrapper;
    await act(async () => {
      jest.spyOn(organizationServices, 'confirmOrganizationAdminTransfer').mockRejectedValueOnce({
        graphQLErrors: [
          {
            extensions: {
              code: ErrorCode.Common.BAD_REQUEST,
            },
          },
        ]
      })
      wrapper = setup();
    })
    expect(wrapper).toMatchSnapshot();
  })
});