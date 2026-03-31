import { EventCollection } from './EventCollection';

export const EventType = {
  TOGGLE_ENABLE: 'toggleEnable',
  TOGGLE_DISABLE: 'toggleDisable',
};

export const ToggleName = {
  AUTO_COMPLETE_FORM_FIELDS: 'autoCompleteFormFields',
};

export const TogglePurpose = {
  [ToggleName.AUTO_COMPLETE_FORM_FIELDS]: {
    [EventType.TOGGLE_ENABLE]: 'Enable the auto-complete form fields feature',
    [EventType.TOGGLE_DISABLE]: 'Disable the auto-complete form fields feature',
  },
};

export class AutoCompleteEventCollection extends EventCollection {
  toggleEnable(): Promise<unknown> {
    const eventType = EventType.TOGGLE_ENABLE;
    const attributes = {
      toggleName: ToggleName.AUTO_COMPLETE_FORM_FIELDS,
      togglePurpose: TogglePurpose[ToggleName.AUTO_COMPLETE_FORM_FIELDS][eventType],
    };
    return this.record({
      name: eventType,
      attributes,
    });
  }

  toggleDisable(): Promise<unknown> {
    const eventType = EventType.TOGGLE_DISABLE;
    const attributes = {
      toggleName: ToggleName.AUTO_COMPLETE_FORM_FIELDS,
      togglePurpose: TogglePurpose[ToggleName.AUTO_COMPLETE_FORM_FIELDS][eventType],
    };
    return this.record({
      name: eventType,
      attributes,
    });
  }
}

export const autoCompleteEvent = new AutoCompleteEventCollection();
