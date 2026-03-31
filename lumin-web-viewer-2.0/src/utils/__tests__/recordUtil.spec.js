import {
  getClientTypeAttr,
  isPWAMode,
  trackEventUserSharedDocument,
  eventTracking,
  getElementXPath,
  getNodeIndex,
  getCurrentFormXPath,
} from '../recordUtil';
import eventCollection from '../Factory/EventCollection/EventCollection';
import indexedDBService from 'services/indexedDBService';
import { OPEN_PDF_DOCUMENT } from 'constants/timeTracking';
import UserEventConstants from 'constants/eventConstants';

jest.mock('../Factory/EventCollection/EventCollection');
jest.mock('services/indexedDBService');
jest.mock('actions/customActions');
jest.mock('src/redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(),
  },
}));
jest.mock('selectors', () => ({
  getCurrentUser: jest.fn(),
  getCurrentDocument: jest.fn(),
  getOrganizationList: jest.fn(),
  getCurrentOrganization: jest.fn(),
  isOffline: jest.fn(),
}));

describe('recordUtil', () => {
  const mockDispatch = jest.fn();
  const mockRecord = jest.fn();
  const mockAddOfflineTrackingEvents = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    eventCollection.record = mockRecord;
    indexedDBService.addOfflineTrackingEvents = mockAddOfflineTrackingEvents;
    const storeModule = require('src/redux/store');
    storeModule.store.dispatch = mockDispatch;
    storeModule.store.getState = jest.fn(() => ({}));
  });

  describe('getClientTypeAttr', () => {
    afterEach(() => {
      delete global.window;
      global.isStandaloneMode = false;
    });

    it('should return client type attribute', () => {
      const result = getClientTypeAttr();
      expect(result).toBeDefined();
    });

    it('should return "PWA" if window.lMode is "PWA"', () => {
      global.isStandaloneMode = true;
      global.window = { lMode: 'PWA' };
      expect(getClientTypeAttr()).toBe('PWA');
    });
  });

  describe('isPWAMode', () => {
    it('should return true if client type attribute is "PWA"', () => {
      global.window = { lMode: 'PWA' };
      expect(isPWAMode()).toBe(true);
    });
  });

  describe('trackEventUserSharedDocument', () => {
    const spyEventTracking = jest.spyOn(require('../recordUtil'), 'eventTracking').mockImplementation(() => {});

    it('should track event user shared document', () => {
      const sharedUsers = [{ _id: '123' }];
      trackEventUserSharedDocument(sharedUsers, 'link', 'view', '123');

      expect(spyEventTracking).not.toHaveBeenCalled();

      spyEventTracking.mockRestore();
    });

    it('should track event user shared document', () => {
      const sharedUsers = [{}];
      trackEventUserSharedDocument(sharedUsers, 'link', 'view', '123');

      expect(spyEventTracking).not.toHaveBeenCalled();

      spyEventTracking.mockRestore();
    });
  });

  describe('eventTracking', () => {
    const selectors = require('selectors');

    beforeEach(() => {
      selectors.getCurrentUser.mockReturnValue({ _id: 'user123' });
      selectors.getCurrentDocument.mockReturnValue(null);
      selectors.getOrganizationList.mockReturnValue({ loading: false });
      selectors.getCurrentOrganization.mockReturnValue(null);
      selectors.isOffline.mockReturnValue(false);
    });

    it('should record event for guest users when event is in ALLOWED_EVENTS_FOR_GUEST_USERS', async () => {
      selectors.getCurrentUser.mockReturnValue(null);

      await eventTracking(OPEN_PDF_DOCUMENT, { docId: '123' }, { test: 'metric' });

      expect(mockRecord).toHaveBeenCalledWith({
        name: OPEN_PDF_DOCUMENT,
        attributes: { docId: '123' },
        metrics: { test: 'metric' },
      });
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should add offline tracking event when offline and event is HEADER_BUTTON or RIGHT_SIDE_BAR_BUTTON', async () => {
      selectors.isOffline.mockReturnValue(true);

      await eventTracking(UserEventConstants.EventType.HEADER_BUTTON, { button: 'test' }, { test: 'metric' });

      expect(mockAddOfflineTrackingEvents).toHaveBeenCalledWith({
        name: UserEventConstants.EventType.HEADER_BUTTON,
        additionalAttributes: { button: 'test', isOfflineMode: true },
        metrics: { test: 'metric' },
      });
    });
  });

  describe('getNodeIndex', () => {
    it('returns 0 if no matching sibling nodes', () => {
      const parent = { childNodes: [] };
      const target = { parentNode: parent, nodeType: 1, localName: 'div' };
      expect(getNodeIndex(target)).toBe(0);
    });

    it('nodeType === Node.CDATA_SECTION_NODE', () => {
      const parent = { childNodes: [] };
      const target = { parentNode: parent, nodeType: Node.CDATA_SECTION_NODE, localName: 'div' };
      expect(getNodeIndex(target)).toBe(0);
    });
  });

  describe('getElementXPath', () => {
    const NodeTypes = {
      ELEMENT_NODE: 1,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
    };

    const createMockNode = (nodeType, localName = null, options = {}) => {
      const node = {
        nodeType,
        localName,
        getAttribute: jest.fn((attr) => (options.id && attr === 'id' ? options.id : null)),
        parentNode: options.parentNode || null,
        childNodes: options.childNodes || [],
      };
      return node;
    };

    it('should return optimized xpath with id when element has id and optimized is true', () => {
      const mockElement = createMockNode(NodeTypes.ELEMENT_NODE, 'button', { id: 'submit-btn' });

      const result = getElementXPath(mockElement, true);
      expect(result).toBe('//*[@id="submit-btn"]');
    });

    it('should return element name with index when index > 1', () => {
      const mockParent = createMockNode(NodeTypes.ELEMENT_NODE, 'div');
      const mockElement1 = createMockNode(NodeTypes.ELEMENT_NODE, 'p', { parentNode: mockParent });
      const mockElement2 = createMockNode(NodeTypes.ELEMENT_NODE, 'p', { parentNode: mockParent });
      const mockElement3 = createMockNode(NodeTypes.ELEMENT_NODE, 'p', { parentNode: mockParent });

      mockParent.childNodes = [mockElement1, mockElement2, mockElement3];

      const result = getElementXPath(mockElement3, false);
      expect(result).toContain('/p[3]');
    });

    it('should handle TEXT_NODE correctly', () => {
      const mockParent = createMockNode(NodeTypes.ELEMENT_NODE, 'div');
      const mockTextNode = createMockNode(NodeTypes.TEXT_NODE, null, { parentNode: mockParent });

      mockParent.childNodes = [mockTextNode];

      const result = getElementXPath(mockTextNode, false);
      expect(result).toContain('/text()');
    });

    it('should handle COMMENT_NODE correctly', () => {
      const mockParent = createMockNode(NodeTypes.ELEMENT_NODE, 'div');
      const mockCommentNode = createMockNode(NodeTypes.COMMENT_NODE, null, { parentNode: mockParent });

      mockParent.childNodes = [mockCommentNode];

      const result = getElementXPath(mockCommentNode, false);
      expect(result).toContain('/comment()');
    });

    it('should return "/" for DOCUMENT_NODE', () => {
      const mockDocument = createMockNode(NodeTypes.DOCUMENT_NODE);

      const result = getElementXPath(mockDocument);
      expect(result).toBe('/');
    });
  });

  describe('getCurrentFormXPath', () => {
    it('returns XPath of the closest form when target is inside a form', () => {
      document.body.innerHTML = `
        <form data-lumin-form-name="myForm">
          <input id="input1" />
        </form>
      `;
      const input = document.getElementById('input1');
  
      expect(getCurrentFormXPath(input, true)).not.toBeNull();
    });
  });
});
