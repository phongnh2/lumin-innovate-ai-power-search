/* eslint-disable class-methods-use-this */
import get from 'lodash/get';

import { ButtonPurpose, ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getElementXPath } from 'utils/recordUtil';

import { trackingQuickSearchValue } from 'features/QuickSearch/utils';

import { AWS_EVENTS } from 'constants/awsEvents';

import { EventCollection } from './EventCollection';

const DEFAULT_XPATH = {
  [ButtonName.MAKE_OFFLINE_AVAILABLE_TOAST]: '/html/body/div/div[2]/div[1]/div[8]/div[2]/button',
};

export class ClickEventCollection extends EventCollection {
  buttonClick({ xPath, tagName, eventType, elementName, elementPurpose, elementValue }) {
    trackingQuickSearchValue();
    const attributes = {
      xPath: xPath || DEFAULT_XPATH[elementName] || '',
      tagName,
      elementName,
      elementPurpose,
      elementValue,
    };
    return this.record({
      name: eventType || AWS_EVENTS.CLICK,
      attributes,
    });
  }

  getElement = (event) => {
    const buttonNameTarget = event.target.closest('[data-lumin-btn-name]');
    const clickableTarget = event.target.closest('button, a, li, [role="button"]');
    return buttonNameTarget || clickableTarget;
  };

  getEventType = (element) => {
    const eventType = get(element, 'dataset.luminBtnEventType');
    const found = [AWS_EVENTS.NAVIGATION, AWS_EVENTS.CLICK].find((type) => eventType === type);
    return found || AWS_EVENTS.CLICK;
  };

  isAtPaymentMfPage() {
    return window.location.pathname === '/payment';
  }

  clickListener = (event) => {
    const element = this.getElement(event);
    // Ignore click event tracking from lumin-payment-mf since it has its own click event listener.
    if (!element || this.isAtPaymentMfPage()) {
      return;
    }
    const elementValue = element.innerText;
    const buttonName = get(element, 'dataset.luminBtnName');
    const eventType = this.getEventType(element);
    const buttonPurpose = ButtonPurpose[buttonName];
    const xPath = getElementXPath(element, true);
    const { tagName } = element;
    // Push this event through central event function to get all common attributes
    this.buttonClick({
      xPath,
      tagName,
      eventType,
      elementName: buttonName,
      elementPurpose: element.dataset.luminBtnPurpose || buttonPurpose,
      elementValue: element.dataset.luminBtnValue || elementValue,
    });
  };
}

export default new ClickEventCollection();
