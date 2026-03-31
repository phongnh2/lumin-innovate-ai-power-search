/* eslint-disable */
let configure = null;
let Adapter = null;

if (process.env.NODE_ENV === 'test') {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, './.env') });

  /**
   * Fix ERR_UNHANDLED_REJECTION error when running jest test with node 16
   * @reference https://stackoverflow.com/questions/50121134/how-do-i-fail-a-test-in-jest-when-an-uncaught-promise-rejection-occurs
   */
  unhandlePromiseListener();

  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder;
  }
  if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = require('util').TextDecoder;
  }
  const enzyme = require('enzyme');
  configure = enzyme.configure;
  Adapter = require('@cfaester/enzyme-adapter-react-18');
  require('regenerator-runtime/runtime');
  jest.mock('utils/Factory/EventCollection/EventCollection', () => {
    return {
      EventCollection: jest.fn(() => ({
        record: jest.fn(),
        getInstance: jest.fn(),
      })),
    };
  });
  const mockLogError = jest.fn();
  const mockLogInfo = jest.fn();
  jest.mock('helpers/logger', () => {
    return {
      __esModule: true,
      default: {
        logError: () => mockLogError(),
        logInfo: () => mockLogInfo(),
      },
    };
  });
  jest.mock('core');
  jest.mock('services/loggerServices', () => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }));
  jest.mock('socket.io-client', () => jest.fn().mockImplementation(() => { return {
    emit: jest.fn(),
    on: jest.fn(),
  } }));
  jest.mock('react-i18next', () => {
    const t = (str) => str;
    return {
      withTranslation: () => (Component) => {
        Component.defaultProps = { ...Component.defaultProps, t };
        return Component;
      },
      Trans: ({ children }) => null,
      useTranslation: () => {
        return { t } & [t];
      },
    };
  });
  jest.mock('hooks/useTranslation', () => ({
    useTranslation: () => ({
      t: (str) => str,
    }),
  }));
  jest.mock('src/redux/store', () => {
    const mockDispatch = jest.fn();
    return {
      store: {
        dispatch: mockDispatch,
        getState: jest.fn(),
        subscribe: jest.fn(),
      },
    };
  });

  global.console = {
    log: jest.fn(), // console.log are ignored in tests
    warn: jest.fn(),

    // Keep native behaviour for other methods, use those to print out things in your own tests, not `console.log`
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  global.opener = {
    postMessage: jest.fn(),
  };

  global.utils = {
    getHashParam: jest.fn().mockReturnValue('{}'),
  };

  global.fetch = jest.fn();

  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}

    disconnect() {
      return null;
    }

    observe() {
      return null;
    }

    takeRecords() {
      return null;
    }

    unobserve() {
      return null;
    }
  };

  class RectangularAreaMeasurement {}

  global.Core = {
    getHashParameter: jest.fn().mockReturnValue('{}'),
    Tools: {
      ToolNames: {
        RECTANGULAR_AREA_MEASUREMENT: new RectangularAreaMeasurement(),
      },
    },
    getCanvasMultiplier: jest.fn().mockReturnValue(1),
  };

  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  // Configure Enzyme with the correct adapter for React 18
  configure({ adapter: new Adapter.default() });
}
function unhandlePromiseListener() {
  if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
    process.on('unhandledRejection', (error) => {
      console.error(error);
    });
    // Avoid memory leak by adding too many listeners
    process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
  }
}
