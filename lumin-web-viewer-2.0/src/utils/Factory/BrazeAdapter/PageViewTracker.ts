/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { getCommonAttributes } from 'utils/getCommonAttributes';

const DEFAULT_EVENT_NAME = 'page_view_pinpoint';
const DEFAULT_APP_TYPE = 'singlePage';
const PREV_URL_STORAGE_KEY = 'braze-prevUrl';

type TrackerEventRecorder = (eventName: string, attributes?: any) => void;

type PageViewTrackingOptions = {
  attributes?: Record<string, string>;
  eventName?: string;
  urlProvider?: () => string;
  appType?: 'multiPage' | 'singlePage';
};

export class PageViewTracker {
  private trackerActive: boolean;

  private options: PageViewTrackingOptions;

  private eventRecorder: TrackerEventRecorder;

  // SPA tracking helpers
  private spaTrackingActive: boolean;

  private pushStateProxy?: any;

  private replaceStateProxy?: any;

  private originalPushState: any;

  private originalReplaceState: any;

  constructor(eventRecorder: TrackerEventRecorder) {
    this.options = {};
    this.trackerActive = true;
    this.eventRecorder = eventRecorder;
    this.spaTrackingActive = false;
    this.handleLocationChange = this.handleLocationChange.bind(this);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.configure(eventRecorder);
  }

  public async configure(eventRecorder: TrackerEventRecorder): Promise<void> {
    this.eventRecorder = eventRecorder;

    // Clean up any existing listeners
    this.cleanup();

    // Apply defaults
    this.options = {
      appType: DEFAULT_APP_TYPE,
      attributes: (await getCommonAttributes({ referrer: document.referrer })) as Record<string, string>,
      eventName: DEFAULT_EVENT_NAME,
      urlProvider: () => window.location.origin + window.location.pathname,
    };
    this.setupSPATracking();
    this.trackerActive = true;
  }

  public cleanup(): void {
    // No-op if document listener is not active
    if (!this.trackerActive) {
      return;
    }

    // Clean up SPA page view listeners
    if (this.spaTrackingActive) {
      window.history.pushState = this.originalPushState;
      window.history.replaceState = this.originalReplaceState;
      this.pushStateProxy?.revoke();
      this.replaceStateProxy?.revoke();
      window.removeEventListener('popstate', this.handleLocationChange);

      this.spaTrackingActive = false;
    }
  }

  private setupSPATracking(): void {
    if (!this.spaTrackingActive) {
      // Configure proxies on History APIs
      this.pushStateProxy = Proxy.revocable(window.history.pushState, {
        apply: (target, thisArg, args) => {
          const proxiedResult = target.apply(thisArg, args as any);

          this.handleLocationChange();

          return proxiedResult;
        },
      });
      this.replaceStateProxy = Proxy.revocable(window.history.replaceState, {
        apply: (target, thisArg, args) => {
          const proxiedResult = target.apply(thisArg, args as any);

          this.handleLocationChange();

          return proxiedResult;
        },
      });

      this.originalPushState = window.history.pushState;
      this.originalReplaceState = window.history.replaceState;
      window.history.pushState = this.pushStateProxy.proxy;
      window.history.replaceState = this.replaceStateProxy.proxy;
      window.addEventListener('popstate', this.handleLocationChange);
      sessionStorage.removeItem(PREV_URL_STORAGE_KEY);
      this.handleLocationChange();
      this.spaTrackingActive = true;
    }
  }

  private handleLocationChange(): void {
    const currentUrl = this.options.urlProvider();
    const eventName = this.options.eventName || DEFAULT_EVENT_NAME;

    if (this.urlHasChanged()) {
      const prevUrl = sessionStorage.getItem(PREV_URL_STORAGE_KEY) ?? '';
      sessionStorage.setItem(PREV_URL_STORAGE_KEY, currentUrl);

      // Assemble attribute list
      const attributes = {
        ...this.options.attributes,
        url: currentUrl,
        previousUrl: prevUrl,
      };

      this.eventRecorder(eventName, attributes);
    }
  }

  private urlHasChanged(): boolean {
    const prevUrl = sessionStorage.getItem(PREV_URL_STORAGE_KEY);
    const currUrl = this.options.urlProvider();

    return currUrl !== prevUrl;
  }
}
