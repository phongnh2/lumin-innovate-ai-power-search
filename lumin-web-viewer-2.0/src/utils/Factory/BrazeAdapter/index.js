import stringUtils from 'utils/string';

import brazeAdaptee from './BrazeAdaptee';

const skippedEvents = ['click', 'timing', 'webVitals', '_session.start', '_session.end'];

const mapObj = {
  PDF: 'Pdf',
  MS: 'Ms',
  MB: 'Mb',
  OS: 'Os',
  OCR: 'Ocr',
  CTA: 'Cta',
};

class BrazeAdapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
  }

  send(record) {
    const { name, attributes, metrics } = record;
    if (skippedEvents.includes(name)) {
      return;
    }
    const eventName = stringUtils.convertToSnakeCase(
      name.replace(/PDF|MS|MB|OS|OCR|CTA/g, (matched) => mapObj[matched])
    );

    const eventParameters = {};
    if (attributes) {
      Object.keys(attributes).forEach((attKey) => {
        eventParameters[attKey] = attributes[attKey];
      });
    }

    if (metrics) {
      Object.keys(metrics).forEach((metricKey) => {
        eventParameters[metricKey] = metrics[metricKey];
      });
    }

    this.adaptee.send({
      name: `${eventName}_pinpoint`,
      parameters: eventParameters,
    });
  }

  initUser(user) {
    this.adaptee.init(user);
  }

  sentEvent({ name, parameters }) {
    this.adaptee.send({ name, parameters });
  }

  sentEventWithoutCookieAccepted({ name, parameters, user }) {
    this.adaptee.sentEventWithoutCookieAccepted({ name, parameters, user });
  }

  clear() {
    this.adaptee.clear();
  }
}

export default new BrazeAdapter(brazeAdaptee);
