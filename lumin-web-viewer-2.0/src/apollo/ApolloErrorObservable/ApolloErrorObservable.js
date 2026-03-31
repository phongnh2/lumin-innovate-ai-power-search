class ApolloErrorObservable {
  constructor() {
    if (ApolloErrorObservable.instance) {
      return ApolloErrorObservable.instance;
    }

    ApolloErrorObservable.instance = this;
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
    errorCode, statusCode, data, metadata,
  }) {
    return this.observers.map((observer) => observer.exec({
      errorCode, statusCode, data, metadata,
    }));
  }
}

export default new ApolloErrorObservable();
