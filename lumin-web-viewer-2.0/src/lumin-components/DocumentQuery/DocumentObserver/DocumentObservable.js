/* eslint-disable no-constructor-return */
import SubscriptionConstants from 'constants/subscriptionConstant';

const { isAddDocumentSubscription } = SubscriptionConstants;

class DocumentObservable {
  constructor() {
    if (DocumentObservable.instance) {
      return DocumentObservable.instance;
    }

    DocumentObservable.instance = this;
    this.observers = [];
    return this;
  }

  subscribe(observer) {
    this.observers.push(
      observer,
    );
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((subscriber) => subscriber.Id !== observer.Id);
  }

  notify({
    event, data, excludedObservers = [],
  }) {
    this.observers.forEach((observer) => {
      const isExcludedObserver = excludedObservers.find((excludedObserver) => observer === excludedObserver);
      const { isSearchView } = data;

      if (isExcludedObserver || isSearchView && isAddDocumentSubscription(event)) {
        return;
      }
      observer.exec({ event, data });
    });
  }
}

export default new DocumentObservable();
