import stringUtils from 'utils/string';

import GaAdaptee from './GaAdaptee';

const mapObj = {
  PDF: 'Pdf',
  MS: 'Ms',
  MB: 'Mb',
  OS: 'Os',
};

class GaAdapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
  }

  send(record) {
    const { name, attributes, metrics, forwardFromPinpoint = true } = record;
    const eventName = stringUtils.convertToSnakeCase(name);

    const eventParameters = {};
    if (attributes) {
      Object.keys(attributes).forEach((attKey) => {
        const convertedKey = stringUtils.convertToSnakeCase(
          attKey.replace(/PDF|MS|MB|OS/g, (matched) => mapObj[matched])
        );
        eventParameters[convertedKey] = attributes[attKey];
      });
    }

    if (metrics) {
      Object.keys(metrics).forEach((metricKey) => {
        const convertedKey = stringUtils.convertToSnakeCase(
          metricKey.replace(/PDF|MS|MB|OS/g, (matched) => mapObj[matched])
        );
        eventParameters[convertedKey] = metrics[metricKey];
      });
    }

    this.adaptee.receive({
      name: forwardFromPinpoint ? `${eventName}_pinpoint` : eventName,
      parameters: eventParameters,
    });
  }
}

export default new GaAdapter(new GaAdaptee());
