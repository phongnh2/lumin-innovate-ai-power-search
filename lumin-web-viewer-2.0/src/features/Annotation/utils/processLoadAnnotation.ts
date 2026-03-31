import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import { documentGraphServices } from 'services/graphServices';

import { updateImageData } from 'helpers/customAnnotationSerializer';
import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import manipulationUtils from 'utils/manipulation';
import stringUtils from 'utils/string';

import { updateAutoDetectDataFromManipStep } from 'features/FormFieldDetection/utils/updateAutoDetectDataFromManipStep';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { WIDGET_TYPE } from 'constants/formBuildTool';
import { LOGGER, MANIPULATION_TYPE } from 'constants/lumin-common';

import { IAnnotation, IDocumentBase, IFormField } from 'interfaces/document/document.interface';

import annotationLoadObserver, { AnnotationEvent } from './annotationLoadObserver';
import { calculatePageTransformation } from './manipulationCalculation';

type TArgs = {
  currentDocument: IDocumentBase;
  usedImageRemoteIds: Set<string>;
  setImageSignedUrlMap: (data: Record<string, string>) => void;
  isOffline: boolean;
  isRemoteDocument: boolean;
};

class InternalAnnotationTransformer {
  private parser: DOMParser;

  private serializer: XMLSerializer;

  private signedUrlMap: Record<string, string> = {};

  private isLoadedSignedUrlMap = false;

  private isAppliedManipulation = false;

  private annots: Array<IAnnotation>;

  private widgets: Array<IFormField>;

  private fieldValue: Array<Pick<IFormField, 'name' | 'value'>>;

  private manipulationStep: Array<Record<string, unknown>>;

  constructor(
    private currentDocument: IDocumentBase,
    private usedImageRemoteIds: Set<string>,
    private setImageSignedUrlMap: (data: Record<string, string>) => void,
    private isOffline: boolean,
    private isRemoteDocument: boolean
  ) {
    this.parser = new DOMParser();
    this.serializer = new XMLSerializer();
    this.manipulationStep = [];
  }

  private transformWidgetAndFormField(pdfInfo: Element, data: IFormField): void {
    const widgets = pdfInfo.querySelectorAll(`& > widget[field="${stringUtils.escapeSelector(data.name)}"]`);
    const formField = pdfInfo.querySelector(`& >ffield[name="${stringUtils.escapeSelector(data.name)}"]`);

    if (data.isDeleted) {
      if (formField) {
        pdfInfo.removeChild(formField);
      }
      widgets.forEach((widget) => {
        pdfInfo.removeChild(widget);
      });
      return;
    }

    const xmlData = this.parser.parseFromString(data.xfdf, 'text/xml');
    const updatedFormField = xmlData.querySelector('ffield');

    if (updatedFormField) {
      if (formField) {
        formField.outerHTML = updatedFormField.outerHTML;
      } else {
        pdfInfo.appendChild(updatedFormField);
      }
    }

    widgets.forEach((widget) => {
      if (widget.parentNode) {
        widget.parentNode.removeChild(widget);
      }
    });

    const updateWidgets = xmlData.querySelectorAll(`widget[field="${stringUtils.escapeSelector(data.name)}"]`);
    const totalPages = core.getTotalPages();
    updateWidgets.forEach((widget) => {
      const page = parseInt(widget.getAttribute('page'));
      /*
       * Skip widgets that have page index beyond the document's total page count
       * This prevents errors when loading annotations from documents
       */
      if (page > totalPages) {
        return;
      }
      pdfInfo.appendChild(widget);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private transformFieldValue(fields: Element, pdfInfo: Element, data: Pick<IFormField, 'name' | 'value'>): boolean {
    const fieldValueElement = data.name
      .split('.')
      .reduce(
        (currentNode: Element, key: string) =>
          currentNode?.querySelector(`field[name="${stringUtils.escapeSelector(key)}"]`),
        fields
      );

    if (!fieldValueElement) {
      return false;
    }

    let valueElement = fieldValueElement.querySelector('value');
    if (valueElement) {
      valueElement.textContent = data.value;
    } else {
      valueElement = document.createElementNS('', 'value');
      valueElement.textContent = data.value;
      fieldValueElement.appendChild(valueElement);
    }

    const formField = pdfInfo.querySelector(`& > ffield[name="${stringUtils.escapeSelector(data.name)}"]`);
    if (formField?.getAttribute('type') === WIDGET_TYPE.TEXT) {
      const widgets = pdfInfo.querySelectorAll(`& > widget[field="${stringUtils.escapeSelector(data.name)}"]`);
      widgets.forEach((widget: Element) => {
        const apref = widget.querySelector('apref');
        if (apref) {
          widget.removeChild(apref);
        }
      });
    }
    return true;
  }

  private transformModifiedInternalFields(xfdfElements: Document): void {
    try {
      const pdfInfo = xfdfElements.querySelector('pdf-info');
      const fields = xfdfElements.querySelector('fields');

      if (pdfInfo) {
        this.widgets.forEach((field) => {
          if (field.xfdf || (field.isInternal && field.isDeleted)) {
            this.transformWidgetAndFormField(pdfInfo, field);
            return false;
          }
        });
      }

      if (fields) {
        this.fieldValue.forEach((field) => {
          if (field.value) {
            this.transformFieldValue(fields, pdfInfo, field);
          }
        });
      }
    } catch (error: unknown) {
      logger.logError({
        reason: LOGGER.Service.PDFTRON,
        error,
      });
    }
  }

  private async applyManipulationSteps(): Promise<void> {
    if (this.currentDocument.manipulationStep && !this.isAppliedManipulation) {
      const manipulationSteps = JSON.parse(this.currentDocument.manipulationStep) as Array<Record<string, unknown>>;
      if (!Array.isArray(manipulationSteps)) {
        return;
      }
      updateAutoDetectDataFromManipStep(manipulationSteps).catch((error) => {
        logger.logError({
          reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
          message: 'Error when update auto detect data from manipulation step',
          error: error as Error,
        });
      });
      // eslint-disable-next-line no-restricted-syntax
      for (const manipulationStep of manipulationSteps) {
        // eslint-disable-next-line no-await-in-loop
        await manipulationUtils.executeManipulationFromData({
          data: manipulationStep,
          thumbs: [],
          needUpdateThumbnail: false,
        });
        if (manipulationStep.type !== MANIPULATION_TYPE.ROTATE_PAGE) {
          this.manipulationStep.push(manipulationStep);
        }
      }
      this.isAppliedManipulation = true;
      fireEvent(CUSTOM_EVENT.FINISHED_MANIPULATE);
    }
  }

  private async updateSignedUrlMap(): Promise<void> {
    if (!this.isLoadedSignedUrlMap && !this.currentDocument.isSystemFile && !this.currentDocument.isAnonymousDocument) {
      if (this.isOffline && this.currentDocument.imageSignedUrls) {
        this.signedUrlMap = this.currentDocument.imageSignedUrls;
      } else if (!this.isOffline) {
        this.signedUrlMap = await documentGraphServices.refreshDocumentImageSignedUrls(this.currentDocument._id);
      }
      this.setImageSignedUrlMap(this.signedUrlMap);
      this.isLoadedSignedUrlMap = true;
    }
  }

  private initializeFields = async (): Promise<void> => {
    if (!this.fieldValue && !this.widgets) {
      this.widgets = this.currentDocument.fields || [];
      if (this.isOffline) {
        const tempActions = await commandHandler.getAllTempAction(this.currentDocument._id);
        const fieldActions = tempActions.filter((action) => action.type === 'field');
        this.widgets = fieldActions.map(({ data }) => data) as unknown as Array<IFormField>;
      }
      this.fieldValue = this.widgets.map(({ name, value }) => ({ name, value }));
    }
  };

  private processParentAnnotations(parentAnnots: Element | null): void {
    if (parentAnnots) {
      this.annots = this.annots.filter(({ annotationId }) => {
        const annot = parentAnnots.querySelector(`[name="${annotationId}"]`);
        if (annot) {
          parentAnnots.removeChild(annot);
          return false;
        }
        return true;
      });

      this.manipulationStep.forEach((manipulationStep) => {
        const pageSet = new Set<number>();
        Array.from(parentAnnots.children).forEach((child) => {
          const page = parseInt(child.getAttribute('page'));
          pageSet.add(page);
        });
        const listPage = Array.from(pageSet).sort();
        const mapObj: Record<number, number> = calculatePageTransformation(manipulationStep, listPage);

        if (Object.keys(mapObj).length > 0) {
          Array.from(parentAnnots.children).forEach((child) => {
            const page = parseInt(child.getAttribute('page'));
            if (typeof mapObj[page] === 'number') {
              if (mapObj[page] !== -1) {
                child.setAttribute('page', mapObj[page].toString());
              } else {
                parentAnnots.removeChild(child);
              }
            }
          });
        }
      });

      const stampAnnots = parentAnnots.querySelectorAll('stamp');
      stampAnnots.forEach((element) => {
        updateImageData(element, this.signedUrlMap, this.usedImageRemoteIds) as unknown as VoidFunction;
      });

      // Handle freetext annotations (temporary solution for LMV-3337)
      const freetextAnnots = parentAnnots.querySelectorAll('freetext');
      freetextAnnots.forEach((element) => {
        const apref = element.querySelector('apref');
        if (apref) {
          element.removeChild(apref);
        }
      });

    }
  }

  public async transform(originalData: string, pages: number[], callback: (xfdf: string) => void): Promise<void> {
    /*
      Prevent loading remote annotations when user insert blank page
    */
    if (selectors.isDocumentLoaded(store.getState())) {
      callback(originalData);
      return;
    }
    await this.applyManipulationSteps();

    if (this.isRemoteDocument) {
      await annotationLoadObserver.wait(AnnotationEvent.ExternalAnnotLoaded);
    }

    if (!this.annots) {
      this.annots = annotationLoadObserver.getAnnotations();
    }

    await this.updateSignedUrlMap();

    const xfdfElements = this.parser.parseFromString(originalData, 'text/xml');
    const parentAnnots = xfdfElements.querySelector('annots');

    await this.initializeFields();
    this.transformModifiedInternalFields(xfdfElements);
    this.processParentAnnotations(parentAnnots);

    const xfdfString = this.serializer.serializeToString(xfdfElements);
    if (!core.getDocument()) {
      return;
    }

    callback(xfdfString);
  }
}

export const setInternalAnnotationTransform = (input: TArgs) => {
  const transformer = new InternalAnnotationTransformer(
    input.currentDocument,
    input.usedImageRemoteIds,
    input.setImageSignedUrlMap,
    input.isOffline,
    input.isRemoteDocument
  );

  return (originalData: string, pages: number[], callback: (xfdf: string) => void) =>
    transformer.transform(originalData, pages, callback);
};
