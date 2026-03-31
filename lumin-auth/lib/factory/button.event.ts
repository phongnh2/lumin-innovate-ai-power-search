import get from 'lodash/get';
import { BaseSyntheticEvent } from 'react';

import { ButtonPurpose } from '@/constants/buttonEvent';
import { LocalStorageKey } from '@/constants/localStorageKey';
import { AWS_EVENTS } from 'constants/awsEvents';

import analyticContainer from './analytic.container';
import { AWSAnalytics } from './aws-analytics';
import { BaseEvent } from './base.event';
import { DatadogAnalytics } from './datadog-analytics';
import { getElementXPath } from './utils';

export type TButtonEvent = {
  xPath: string;
  tagName: string;
  elementName: string;
  elementPurpose: string;
};

type TSignInOidcProps = {
  e: MouseEvent | BaseSyntheticEvent;
  isSignIn: boolean;
};

export class ButtonEventCollection extends BaseEvent {
  buttonClick({ xPath, tagName, elementName, elementPurpose }: TButtonEvent) {
    const attributes = {
      xPath: xPath || '',
      tagName,
      elementName,
      elementPurpose
    };
    return this.record({
      name: AWS_EVENTS.CLICK,
      attributes,
      immediate: true
    });
  }

  private getElement = (event: MouseEvent | BaseSyntheticEvent) => {
    const buttonNameTarget = (event.target as HTMLElement).closest('[data-lumin-btn-name]');
    const clickableTarget = (event.target as HTMLElement).closest('button') || (event.target as HTMLElement).closest('a');
    return buttonNameTarget || clickableTarget;
  };

  private getAttributes = (element: Element) => {
    const buttonName = get(element, 'dataset.luminBtnName') as unknown as string;
    const buttonPurpose = ButtonPurpose[buttonName];
    const xPath = getElementXPath({ target: element as HTMLElement, optimized: true });
    const { tagName } = element;
    return {
      xPath,
      tagName,
      elementName: buttonName,
      elementPurpose: (element as HTMLElement).dataset.luminBtnPurpose || buttonPurpose
    };
  };

  clickListener = (event: MouseEvent) => {
    const element = this.getElement(event);
    if (element) {
      const attributes = this.getAttributes(element);
      // Push this event through central event function to get all common attributes
      this.buttonClick(attributes);
    }
  };

  signInGoogle = (element: Element | null) => {
    if (element) {
      const attributes = this.getAttributes(element);
      this.buttonClick(attributes);
    }
  };

  signInOidc = ({ e, isSignIn }: TSignInOidcProps) => {
    document.getElementById('googleBtn');
    const element = this.getElement(e);
    if (element) {
      const attributes = this.getAttributes(element);
      localStorage.setItem(isSignIn ? LocalStorageKey.SIGN_IN : LocalStorageKey.SIGN_UP, `${JSON.stringify(attributes)}`);
    }
  };
}

export const buttonEvent = new ButtonEventCollection(analyticContainer.get(AWSAnalytics.providerName), analyticContainer.get(DatadogAnalytics.providerName));
