import { IAnnotation } from "interfaces/document/document.interface";

export enum AnnotationEvent {
  ExternalAnnotLoaded = 'external_annot_loaded',
  FormFieldAnnotLoaded = 'form_field_annot_loaded',
}

type Callback = () => unknown | Promise<unknown>;

class AnnotationLoadObserver {
  private state = {
    [AnnotationEvent.ExternalAnnotLoaded]: false,
    [AnnotationEvent.FormFieldAnnotLoaded]: false,
  };

  private externalAnnotLoadedEvent: Callback = null;

  private formFieldAnnotLoadedEvent: Callback = null;

  private annotationData: IAnnotation[] = [];

  setAnnotations(annots: IAnnotation[]) {
    this.annotationData = annots;
  }

  getAnnotations(): IAnnotation[] {
    return this.annotationData;
  }

  notify(event: AnnotationEvent) {
    this.state[event] = true;
    switch (event) {
      case AnnotationEvent.ExternalAnnotLoaded: {
        this.externalAnnotLoadedEvent?.();
        break;
      }
      case AnnotationEvent.FormFieldAnnotLoaded: {
        this.formFieldAnnotLoadedEvent?.();
        break;
      }
      default: {
        break;
      }
    }
  }

  on(event: AnnotationEvent, cb: Callback): this {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (event) {
      case AnnotationEvent.ExternalAnnotLoaded: {
        this.externalAnnotLoadedEvent = cb;
        break;
      }
      case AnnotationEvent.FormFieldAnnotLoaded: {
        this.formFieldAnnotLoadedEvent = cb;
        break;
      }
      default: {
        break;
      }
    }
    if (this.state[event]) {
      this.notify(event);
    }
    return this;
  }

  wait(event: AnnotationEvent): Promise<void> {
    return new Promise((resolve) => {
      if (this.state[event]) {
        resolve();
      } else {
        this.on(event, resolve);
      }
    });
  }

  clean() {
    this.state = {
      [AnnotationEvent.ExternalAnnotLoaded]: false,
      [AnnotationEvent.FormFieldAnnotLoaded]: false,
    };
    this.setAnnotations([]);
  }
}

export default new AnnotationLoadObserver();
