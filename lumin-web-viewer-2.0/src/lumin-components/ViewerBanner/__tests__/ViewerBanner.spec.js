import React from 'react';
import { MemoryRouter } from 'react-router';
import { renderWithRedux } from 'utils/test-utils';
import { act } from 'react-dom/test-utils';
import ViewerBanner from '../ViewerBanner';
import ViewerContext from '../../../screens/Viewer/Context';

jest.mock('helpers/getCurrentRole')
jest.mock('constants/theme/Button', () => ({
  buttonColorGetter: () => ({root: {}, disabled: {}, hover: {}, pressed: {}}),
  buttonClassBuilder: () => ({root: {}, disabled: {}, hover: {}, pressed: {}}),
}));

jest.mock("../useShowOCRBanner.js", () => ({
  __esModule: true,
  default: () => false,
}));
const defaultState = {
  viewer: {
    isShowBannerAds: true,
    disabledElements: {
      leftPanel: {
        disabled: false,
      },
    },
    tab: {},
    openElements: {
      leftPanel: {},
    },
    customElementOverrides: {},
    isLoadingDocument: false,

  },
  payment: {
    willExpire: {
      FREE_TRIAL_30: {
        status: 4,
        timeStamp: null,
      },
    },
  },
  auth: {
    currentUser: {
      name: 'Qui Nguyen',
    },
    currentDocument: {
      documentType: "ORGANIZATION",
    }
  },
};


describe('ViewerBanner', () => {
  describe('on start', () => {
    const props = {
      history: {
        push: jest.fn(),
        go: jest.fn(),
      },
    };

    it('CASE 1: user is using premium', () => {
      const { instance } = renderWithRedux(
          <MemoryRouter>
            <ViewerBanner {...props} />
          </MemoryRouter>,
        {
          initialState: { ...defaultState },
        }
      );
      expect(instance).toMatchSnapshot();
    });

    it('CASE 2: user not using free trial', () => {
      const { instance } = renderWithRedux(
          <MemoryRouter>
            <ViewerBanner {...props} />
          </MemoryRouter>,
        {
          initialState: {
            ...defaultState,
            viewer: {
              isShowBannerAds: false,
              disabledElements: {},
              openElements: {
                leftPanel: false,
              },
              isLoadingDocument: false,
            },
            payment: {
              willExpire: {},
            },
          },
        }
      );
      expect(instance).toMatchSnapshot();
    });

    it('CASE 3: CAN_USE_FREE_TRIAL, start free trial', () => {
      const { instance } = renderWithRedux(
          <MemoryRouter>
            <ViewerBanner {...props} />
          </MemoryRouter>,
        {
          initialState: {
            ...defaultState,
            viewer: {
              isShowBannerAds: true,
              disabledElements: {},
              tab: {},
              openElements: {
                leftPanel: false,
              },
              customElementOverrides: {},
              isLoadingDocument: false,
            },
            payment: {
              willExpire: {
                FREE_TRIAL_30: {
                  status: 1,
                  timeStamp: null,
                },
              },
            },
          },
        }
      );

      expect(instance).toMatchSnapshot();
    });

    it('CASE 4: CAN_USE_FREE_TRIAL, close dialog free trial', () => {
      const { instance } = renderWithRedux(
          <MemoryRouter>
            <ViewerBanner {...props} />
          </MemoryRouter>,
        {
          initialState: {
            ...defaultState,
            viewer: {
              isShowBannerAds: true,
              disabledElements: {},
              tab: {},
              openElements: {
                leftPanel: false,
              },
              customElementOverrides: {},
              isLoadingDocument: false,
            },
            payment: {
              willExpire: {
                FREE_TRIAL_30: {
                  status: 1,
                  timeStamp: null,
                },
              },
            },
          },
        }
      );

      expect(instance).toMatchSnapshot();
    });

    it('CASE 5: USING_FREE_TRIAL, start free trial', () => {
      const { instance } = renderWithRedux(
          <MemoryRouter>
            <ViewerBanner {...props} />
          </MemoryRouter>,
        {
          initialState: {
            ...defaultState,
            viewer: {
              isShowBannerAds: true,
              disabledElements: {},
              tab: {},
              openElements: {
                leftPanel: false,
              },
              customElementOverrides: {},
              isLoadingDocument: false,
            },
            payment: {
              willExpire: {
                FREE_TRIAL_30: {
                  status: 3,
                  timeStamp: null,
                },
              },
            },
          },
        }
      );

      expect(instance).toMatchSnapshot();
    });

    it('CASE 6: CANNOT_USE_FREE_TRIAL, start free trial', () => {
      const { instance } = renderWithRedux(
          <MemoryRouter>
            <ViewerBanner {...props} />
          </MemoryRouter>,
        {
          initialState: {
            ...defaultState,
            viewer: {
              isShowBannerAds: true,
              disabledElements: {},
              tab: {},
              openElements: {
                leftPanel: false,
              },
              customElementOverrides: {},
              isLoadingDocument: false,
            },
            payment: {
              willExpire: {
                FREE_TRIAL_30: {
                  status: 2,
                  timeStamp: null,
                },
              },
            },
          },
        }
      );

      expect(instance).toMatchSnapshot();
    });
  });
});