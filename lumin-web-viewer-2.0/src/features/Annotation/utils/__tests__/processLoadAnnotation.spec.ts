import core from 'core';
import selectors from 'selectors';
import { documentGraphServices } from 'services/graphServices';
import manipulationUtils from 'utils/manipulation';
import annotationLoadObserver from '../annotationLoadObserver';
import { setInternalAnnotationTransform } from '../processLoadAnnotation';
import { updateImageData } from 'helpers/customAnnotationSerializer';
import { commandHandler } from 'HOC/OfflineStorageHOC';
import { updateAutoDetectDataFromManipStep } from 'features/FormFieldDetection/utils/updateAutoDetectDataFromManipStep';
import logger from 'helpers/logger';

jest.mock('core', () => ({
  getTotalPages: jest.fn(),
  getDocument: jest.fn(),
  getAnnotationsList: jest.fn(),
  isDocumentLoaded: jest.fn(),
}));

jest.mock('selectors', () => ({
  isDocumentLoaded: jest.fn(),
}));

jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock('HOC/OfflineStorageHOC', () => ({
  commandHandler: {
    getAllTempAction: jest.fn(),
  },
}));

jest.mock('services/graphServices', () => ({
  documentGraphServices: {
    refreshDocumentImageSignedUrls: jest.fn(),
  },
}));

jest.mock('helpers/customAnnotationSerializer', () => ({
  updateImageData: jest.fn(),
}));

jest.mock('helpers/fireEvent', () => jest.fn());

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('utils/manipulation', () => ({
  executeManipulationFromData: jest.fn(),
}));

jest.mock('utils/string', () => ({
  escapeSelector: jest.fn((str) => str),
}));

jest.mock('features/FormFieldDetection/utils/updateAutoDetectDataFromManipStep', () => ({
  updateAutoDetectDataFromManipStep: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../annotationLoadObserver', () => ({
  wait: jest.fn(),
  getAnnotations: jest.fn(),
  AnnotationEvent: {
    ExternalAnnotLoaded: 'external_annot_loaded',
  },
}));

// Polyfill for CSS nesting selector '& >' which JSDOM doesn't support
const originalElementQuerySelector = Element.prototype.querySelector;
const originalElementQuerySelectorAll = Element.prototype.querySelectorAll;
const originalDocQuerySelector = Document.prototype.querySelector;
const originalDocQuerySelectorAll = Document.prototype.querySelectorAll;

const normalizeSelector = (selector: string) => {
  // Handle '& >' or '& > ' prefix (CSS nesting combinator) - treat like :scope >
  return selector.replace(/^&\s*>\s*/, ':scope > ').replace(/^&\s*>/, ':scope > ');
};

Element.prototype.querySelector = function (selector: string) {
  return originalElementQuerySelector.call(this, normalizeSelector(selector));
};

Element.prototype.querySelectorAll = function (selector: string) {
  return originalElementQuerySelectorAll.call(this, normalizeSelector(selector));
};

Document.prototype.querySelector = function (selector: string) {
  return originalDocQuerySelector.call(this, normalizeSelector(selector));
};

Document.prototype.querySelectorAll = function (selector: string) {
  return originalDocQuerySelectorAll.call(this, normalizeSelector(selector));
};

describe('processLoadAnnotation', () => {
  const mockDocumentId = 'doc-123';
  const mockCurrentDocument = {
    _id: mockDocumentId,
    manipulationStep: JSON.stringify([{ type: 'rotate' }]),
    isSystemFile: false,
    isAnonymousDocument: false,
    fields: [] as any[],
  };
  const mockSetImageSignedUrlMap = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    (core.getDocument as jest.Mock).mockReturnValue({});
    (selectors.isDocumentLoaded as jest.Mock).mockReturnValue(false);
    (annotationLoadObserver.getAnnotations as jest.Mock).mockReturnValue([]);
    (annotationLoadObserver.wait as jest.Mock).mockResolvedValue(undefined);
  });

  const getTransformer = (overrides = {}) => {
    return setInternalAnnotationTransform({
      currentDocument: mockCurrentDocument as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: mockSetImageSignedUrlMap,
      isOffline: false,
      isRemoteDocument: false,
      ...overrides,
    });
  };

  it('should simply invoke callback with original data if document is already loaded (prevent duplicate load)', async () => {
    (selectors.isDocumentLoaded as jest.Mock).mockReturnValue(true);
    const transform = getTransformer();
    const callback = jest.fn();

    await transform('<xfdf></xfdf>', [1], callback);

    expect(callback).toHaveBeenCalledWith('<xfdf></xfdf>');
    expect(manipulationUtils.executeManipulationFromData).not.toHaveBeenCalled();
  });

  it('should apply manipulation steps if present', async () => {
    const transform = getTransformer();
    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());

    expect(manipulationUtils.executeManipulationFromData).toHaveBeenCalledTimes(1);
    expect(manipulationUtils.executeManipulationFromData).toHaveBeenCalledWith(
      expect.objectContaining({ data: { type: 'rotate' } })
    );
  });

  it('should wait for external annotations if isRemoteDocument is true', async () => {
    const transform = getTransformer({ isRemoteDocument: true });
    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());

    expect(annotationLoadObserver.wait).toHaveBeenCalledWith(
      'external_annot_loaded'
    );
  });

  it('should update signed URL map correctly in online mode', async () => {
    (documentGraphServices.refreshDocumentImageSignedUrls as jest.Mock).mockResolvedValue({
      'img1': 'signed-url-1',
    });

    const transform = getTransformer({ isOffline: false });
    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());

    expect(documentGraphServices.refreshDocumentImageSignedUrls).toHaveBeenCalledWith(mockDocumentId);
    expect(mockSetImageSignedUrlMap).toHaveBeenCalledWith({ 'img1': 'signed-url-1' });
  });

  it('should transform widgets by removing them if they exceed total pages', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(5);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <widget field="field1" page="1" />
          <widget field="field1" page="10" />
        </pdf-info>
        <fields>
           <field name="field1"><value>test</value></field>
        </fields>
      </xfdf>
    `;

    // xfdf needs a root element for DOMParser to parse multiple elements
    const docWithFields = {
      ...mockCurrentDocument,
      fields: [{
        name: 'field1',
        xfdf: '<root><ffield name="field1"/><widget field="field1" page="1"/><widget field="field1" page="10"/></root>',
        value: 'val'
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithFields as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];

    // Page 10 widget should be excluded because totalPages is 5
    expect(resultXml).toContain('page="1"');
    expect(resultXml).not.toContain('page="10"');
  });

  it('should remove "apref" from freetext annotations', async () => {
    const mockXfdf = `
      <xfdf>
        <annots>
          <freetext name="ft1">
            <apref name="ap1"/>
          </freetext>
        </annots>
      </xfdf>
    `;

    const transform = getTransformer();
    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];
    expect(resultXml).toContain('<freetext name="ft1">');
    expect(resultXml).not.toContain('<apref');
  });

  it('should call updateImageData for stamp annotations', async () => {
    const mockXfdf = `
      <xfdf>
        <annots>
          <stamp name="stamp1"></stamp>
        </annots>
      </xfdf>
    `;

    const transform = getTransformer();
    await transform(mockXfdf, [1], jest.fn());

    expect(updateImageData).toHaveBeenCalled();
  });

  it('should skip transformation callback if core.getDocument() returns null (document closed mid-process)', async () => {
    (core.getDocument as jest.Mock).mockReturnValue(null);
    const transform = getTransformer();
    const callback = jest.fn();

    await transform('<xfdf><annots/></xfdf>', [1], callback);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should remove widgets and formField when field is marked as deleted', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <widget field="deletedField" page="1" />
          <ffield name="deletedField" type="Tx"/>
        </pdf-info>
        <fields></fields>
      </xfdf>
    `;

    // xfdf is required to trigger transformWidgetAndFormField
    const docWithDeletedField = {
      ...mockCurrentDocument,
      fields: [{
        name: 'deletedField',
        isDeleted: true,
        xfdf: '<ffield name="deletedField" type="Tx"/>'
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithDeletedField as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];
    // When isDeleted is true, widgets and ffield should be removed
    expect(resultXml).not.toContain('<widget field="deletedField"');
    expect(resultXml).not.toContain('<ffield name="deletedField"');
  });

  it('should update existing formField with new xfdf data', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <widget field="existingField" page="1" />
          <ffield name="existingField" type="Tx"/>
        </pdf-info>
        <fields>
          <field name="existingField"><value></value></field>
        </fields>
      </xfdf>
    `;

    // xfdf needs a root element for DOMParser to parse multiple elements
    const docWithField = {
      ...mockCurrentDocument,
      fields: [{
        name: 'existingField',
        xfdf: '<root><ffield name="existingField" type="Btn"/><widget field="existingField" page="2"/></root>',
        value: 'newValue',
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithField as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];
    // Old widget with page="1" should be removed and new widget with page="2" should be added
    expect(resultXml).not.toContain('page="1"');
    expect(resultXml).toContain('page="2"');
  });

  it('should append new formField when it does not exist', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info></pdf-info>
        <fields>
          <field name="newField"><value></value></field>
        </fields>
      </xfdf>
    `;

    // xfdf needs a root element for DOMParser to parse multiple elements
    const docWithNewField = {
      ...mockCurrentDocument,
      fields: [{
        name: 'newField',
        xfdf: '<root><ffield name="newField" type="Tx"/><widget field="newField" page="1"/></root>',
        value: 'testValue',
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithNewField as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];
    // The new ffield should be appended
    expect(resultXml).toContain('<ffield name="newField"');
    expect(resultXml).toContain('widget field="newField"');
  });

  it('should transform field values and create value element if not exists', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <ffield name="textField" type="Tx"/>
          <widget field="textField" page="1"><apref name="ap"/></widget>
        </pdf-info>
        <fields>
          <field name="textField"></field>
        </fields>
      </xfdf>
    `;

    const docWithFieldValue = {
      ...mockCurrentDocument,
      fields: [{
        name: 'textField',
        value: 'updatedValue',
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithFieldValue as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];
    expect(resultXml).toContain('<value>updatedValue</value>');
    // For TEXT type (Tx) widgets, apref should be removed when value is updated
    expect(resultXml).not.toContain('<apref');
  });

  it('should handle nested field names in transformFieldValue', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <ffield name="parent.child" type="Tx"/>
        </pdf-info>
        <fields>
          <field name="parent">
            <field name="child"><value>old</value></field>
          </field>
        </fields>
      </xfdf>
    `;

    const docWithNestedField = {
      ...mockCurrentDocument,
      fields: [{
        name: 'parent.child',
        value: 'nestedValue',
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithNestedField as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];
    expect(resultXml).toContain('<value>nestedValue</value>');
  });

  it('should skip field value transformation when field element not found', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info></pdf-info>
        <fields></fields>
      </xfdf>
    `;

    const docWithMissingField = {
      ...mockCurrentDocument,
      fields: [{
        name: 'nonExistentField',
        value: 'someValue',
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithMissingField as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    // Should complete without error
    expect(callback).toHaveBeenCalled();
  });

  it('should skip manipulation when manipulationStep is not a valid array', async () => {
    const docWithInvalidManipStep = {
      ...mockCurrentDocument,
      manipulationStep: JSON.stringify({ invalid: 'object' }),
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithInvalidManipStep as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform('<xfdf><annots/></xfdf>', [1], callback);

    expect(manipulationUtils.executeManipulationFromData).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it('should log error when updateAutoDetectDataFromManipStep fails', async () => {
    const mockError = new Error('Auto detect failed');
    (updateAutoDetectDataFromManipStep as jest.Mock).mockRejectedValueOnce(mockError);

    const transform = getTransformer();
    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());

    // Wait for the async error handler
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(logger.logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error when update auto detect data from manipulation step',
        error: mockError,
      })
    );
  });

  it('should use imageSignedUrls from document when offline', async () => {
    // Mock getAllTempAction to return empty array for offline mode
    (commandHandler.getAllTempAction as jest.Mock).mockResolvedValue([]);

    const mockImageSignedUrls = { 'img1': 'offline-url-1' };
    const docWithSignedUrls = {
      ...mockCurrentDocument,
      imageSignedUrls: mockImageSignedUrls,
    };

    const setImageSignedUrlMapMock = jest.fn();
    const transform = setInternalAnnotationTransform({
      currentDocument: docWithSignedUrls as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: setImageSignedUrlMapMock,
      isOffline: true,
      isRemoteDocument: false,
    });

    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());

    expect(documentGraphServices.refreshDocumentImageSignedUrls).not.toHaveBeenCalled();
    expect(setImageSignedUrlMapMock).toHaveBeenCalledWith(mockImageSignedUrls);
  });

  it('should get fields from temp actions when offline', async () => {
    const mockTempActions = [
      { type: 'field', data: { name: 'offlineField', value: 'offlineValue', xfdf: '<ffield name="offlineField"/>' } },
      { type: 'other', data: {} },
    ];
    (commandHandler.getAllTempAction as jest.Mock).mockResolvedValue(mockTempActions);

    const mockXfdf = `
      <xfdf>
        <pdf-info></pdf-info>
        <fields>
          <field name="offlineField"><value></value></field>
        </fields>
      </xfdf>
    `;

    const transform = setInternalAnnotationTransform({
      currentDocument: { ...mockCurrentDocument, imageSignedUrls: {} } as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: true,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    expect(commandHandler.getAllTempAction).toHaveBeenCalledWith(mockDocumentId);
  });

  it('should filter out annotations that exist in parentAnnots', async () => {
    const mockAnnotations = [
      { annotationId: 'annot1' },
      { annotationId: 'annot2' },
    ];
    (annotationLoadObserver.getAnnotations as jest.Mock).mockReturnValue(mockAnnotations);

    const mockXfdf = `
      <xfdf>
        <annots>
          <text name="annot1"/>
          <highlight name="annot3"/>
        </annots>
      </xfdf>
    `;

    const transform = getTransformer();
    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];
    // annot1 should be removed since it exists in annotations list
    expect(resultXml).not.toContain('name="annot1"');
    // annot3 should remain since it's not in the annotations list
    expect(resultXml).toContain('name="annot3"');
  });

  it('should handle transformModifiedInternalFields error gracefully', async () => {
    // Create a malformed document that would cause an error in querySelector
    const docWithMalformedField = {
      ...mockCurrentDocument,
      fields: [{
        name: 'field',
        xfdf: 'invalid-xml',
        isInternal: false,
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithMalformedField as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform('<xfdf><pdf-info></pdf-info><fields></fields></xfdf>', [1], callback);

    // Should complete without throwing
    expect(callback).toHaveBeenCalled();
  });

  it('should log error when transformModifiedInternalFields throws', async () => {
    // Create a field with a name that will cause querySelectorAll to throw when using special characters
    // that bypass the escapeSelector mock
    const originalQuerySelectorAll = Element.prototype.querySelectorAll;
    const mockError = new Error('Query selector failed');

    // Temporarily mock querySelectorAll to throw for specific selector
    Element.prototype.querySelectorAll = function(selector: string) {
      if (selector.includes('widget[field=')) {
        throw mockError;
      }
      return originalQuerySelectorAll.call(this, normalizeSelector(selector));
    };

    const docWithField = {
      ...mockCurrentDocument,
      fields: [{
        name: 'errorField',
        xfdf: '<root><ffield name="errorField"/></root>',
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithField as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform('<xfdf><pdf-info></pdf-info><fields></fields></xfdf>', [1], callback);

    // Restore original querySelectorAll
    Element.prototype.querySelectorAll = originalQuerySelectorAll;

    // Should log error and still call callback
    expect(logger.logError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: mockError,
      })
    );
    expect(callback).toHaveBeenCalled();
  });

  it('should handle deleted field when formField does not exist', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <widget field="deletedFieldNoForm" page="1" />
        </pdf-info>
        <fields></fields>
      </xfdf>
    `;

    const docWithDeletedFieldNoForm = {
      ...mockCurrentDocument,
      fields: [{
        name: 'deletedFieldNoForm',
        isDeleted: true,
        xfdf: '<ffield name="deletedFieldNoForm"/>'
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithDeletedFieldNoForm as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    // Should complete without error even when formField doesn't exist
    expect(callback).toHaveBeenCalled();
  });

  it('should handle widget without parentNode when removing', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <widget field="fieldWithoutParent" page="1" />
          <ffield name="fieldWithoutParent" type="Tx"/>
        </pdf-info>
        <fields></fields>
      </xfdf>
    `;

    // Mock querySelectorAll to return a NodeList with a detached widget
    const originalQuerySelectorAll = Element.prototype.querySelectorAll;
    Element.prototype.querySelectorAll = function(selector: string) {
      const result = originalQuerySelectorAll.call(this, normalizeSelector(selector));
      if (selector.includes('widget[field="fieldWithoutParent"')) {
        // Create a detached widget (no parentNode)
        const detachedWidget = document.createElement('widget');
        detachedWidget.setAttribute('field', 'fieldWithoutParent');
        detachedWidget.setAttribute('page', '1');

        // Wrap the NodeList to include the detached widget
        const realNodes = Array.from(result);
        return {
          ...result,
          length: realNodes.length + 1,
          item: (index: number) => (index < realNodes.length ? realNodes[index] : (index === realNodes.length ? detachedWidget : null)),
          forEach: function(callback: (item: Element) => void) {
            realNodes.forEach(callback);
            callback(detachedWidget);
          },
          [Symbol.iterator]: function* () {
            yield* realNodes;
            yield detachedWidget;
          },
        } as unknown as NodeListOf<Element>;
      }
      return result;
    };

    const docWithField = {
      ...mockCurrentDocument,
      fields: [{
        name: 'fieldWithoutParent',
        xfdf: '<root><ffield name="fieldWithoutParent" type="Tx"/></root>',
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithField as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    // Restore original
    Element.prototype.querySelectorAll = originalQuerySelectorAll;

    // Should handle gracefully when widget has no parentNode
    expect(callback).toHaveBeenCalled();
  });

  it('should handle widget without page attribute in filterWidgetsExceedingTotalPages', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <widget field="fieldNoPage" />
        </pdf-info>
        <fields></fields>
      </xfdf>
    `;

    const transform = getTransformer();
    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    // Should handle widget without page attribute (defaults to 0)
    expect(callback).toHaveBeenCalled();
  });

  it('should handle widget without parentNode in filterWidgetsExceedingTotalPages', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(5);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <widget field="fieldExceedPages" page="10" />
        </pdf-info>
        <fields></fields>
      </xfdf>
    `;

    // Mock querySelectorAll to return a widget without parentNode
    const originalQuerySelectorAll = Element.prototype.querySelectorAll;
    Element.prototype.querySelectorAll = function(selector: string) {
      const result = originalQuerySelectorAll.call(this, normalizeSelector(selector));
      if (selector === 'widget') {
        // Create a detached widget that exceeds pages
        const detachedWidget = document.createElement('widget');
        detachedWidget.setAttribute('field', 'fieldExceedPages');
        detachedWidget.setAttribute('page', '10');

        const realNodes = Array.from(result);
        return {
          ...result,
          length: realNodes.length + 1,
          item: (index: number) => (index < realNodes.length ? realNodes[index] : (index === realNodes.length ? detachedWidget : null)),
          forEach: function(callback: (item: Element) => void) {
            realNodes.forEach(callback);
            callback(detachedWidget);
          },
          [Symbol.iterator]: function* () {
            yield* realNodes;
            yield detachedWidget;
          },
        } as unknown as NodeListOf<Element>;
      }
      return result;
    };

    const transform = getTransformer();
    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    // Restore original
    Element.prototype.querySelectorAll = originalQuerySelectorAll;

    // Should handle widget exceeding pages even if it has no parentNode
    expect(callback).toHaveBeenCalled();
  });

  it('should handle field with isInternal and isDeleted', async () => {
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
    const mockXfdf = `
      <xfdf>
        <pdf-info>
          <widget field="internalDeleted" page="1" />
          <ffield name="internalDeleted" type="Tx"/>
        </pdf-info>
        <fields></fields>
      </xfdf>
    `;

    const docWithInternalDeleted = {
      ...mockCurrentDocument,
      fields: [{
        name: 'internalDeleted',
        isDeleted: true,
        isInternal: true,
      }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithInternalDeleted as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    // Should process internal deleted field
    expect(callback).toHaveBeenCalled();
  });

  it('should skip manipulation steps when already applied', async () => {
    const docWithManipStep = {
      ...mockCurrentDocument,
      manipulationStep: JSON.stringify([{ type: 'rotate' }]),
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithManipStep as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    // First call applies manipulation
    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());
    expect(manipulationUtils.executeManipulationFromData).toHaveBeenCalledTimes(1);

    // Second call should skip because isAppliedManipulation is true
    jest.clearAllMocks();
    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());
    expect(manipulationUtils.executeManipulationFromData).not.toHaveBeenCalled();
  });

  it('should skip updateSignedUrlMap when document is system file', async () => {
    const systemFileDoc = {
      ...mockCurrentDocument,
      isSystemFile: true,
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: systemFileDoc as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());

    expect(documentGraphServices.refreshDocumentImageSignedUrls).not.toHaveBeenCalled();
  });

  it('should skip updateSignedUrlMap when document is anonymous', async () => {
    const anonymousDoc = {
      ...mockCurrentDocument,
      isAnonymousDocument: true,
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: anonymousDoc as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());

    expect(documentGraphServices.refreshDocumentImageSignedUrls).not.toHaveBeenCalled();
  });

  it('should skip updateSignedUrlMap when already loaded', async () => {
    const transform = getTransformer();

    // First call loads signed URL map
    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());
    expect(documentGraphServices.refreshDocumentImageSignedUrls).toHaveBeenCalledTimes(1);

    // Second call should skip because isLoadedSignedUrlMap is true
    jest.clearAllMocks();
    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());
    expect(documentGraphServices.refreshDocumentImageSignedUrls).not.toHaveBeenCalled();
  });

  it('should handle offline mode when imageSignedUrls is not available', async () => {
    (commandHandler.getAllTempAction as jest.Mock).mockResolvedValue([]);

    const docWithoutSignedUrls = {
      ...mockCurrentDocument,
      imageSignedUrls: undefined,
    };

    const setImageSignedUrlMapMock = jest.fn();
    const transform = setInternalAnnotationTransform({
      currentDocument: docWithoutSignedUrls as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: setImageSignedUrlMapMock,
      isOffline: true,
      isRemoteDocument: false,
    });

    await transform('<xfdf><annots/></xfdf>', [1], jest.fn());

    // Should not call refreshDocumentImageSignedUrls in offline mode
    expect(documentGraphServices.refreshDocumentImageSignedUrls).not.toHaveBeenCalled();
    // Should still set empty map
    expect(setImageSignedUrlMapMock).toHaveBeenCalled();
  });

  it('should handle freetext annotation without apref', async () => {
    const mockXfdf = `
      <xfdf>
        <annots>
          <freetext name="ft1">
            <content>Some text</content>
          </freetext>
        </annots>
      </xfdf>
    `;

    const transform = getTransformer();
    const callback = jest.fn();
    await transform(mockXfdf, [1], callback);

    const resultXml = callback.mock.calls[0][0];
    // Should handle freetext without apref gracefully
    expect(resultXml).toContain('<freetext name="ft1"');
  });

  it('should use existing annots when already set', async () => {
    const mockAnnotations = [
      { annotationId: 'annot1' },
      { annotationId: 'annot2' },
    ];
    (annotationLoadObserver.getAnnotations as jest.Mock).mockReturnValue(mockAnnotations);

    const transform = getTransformer();

    // First call sets annots
    await transform('<xfdf><annots><text name="annot1"/></annots></xfdf>', [1], jest.fn());
    expect(annotationLoadObserver.getAnnotations).toHaveBeenCalledTimes(1);

    // Second call should use existing annots
    jest.clearAllMocks();
    await transform('<xfdf><annots><text name="annot1"/></annots></xfdf>', [1], jest.fn());
    // Should not call getAnnotations again
    expect(annotationLoadObserver.getAnnotations).not.toHaveBeenCalled();
  });

  it('should skip initializeFields when fields are already initialized', async () => {
    const docWithFields = {
      ...mockCurrentDocument,
      fields: [{ name: 'field1', value: 'value1' }],
    };

    const transform = setInternalAnnotationTransform({
      currentDocument: docWithFields as any,
      usedImageRemoteIds: new Set(),
      setImageSignedUrlMap: jest.fn(),
      isOffline: false,
      isRemoteDocument: false,
    });

    // First call initializes fields
    await transform('<xfdf><pdf-info></pdf-info><fields></fields></xfdf>', [1], jest.fn());
    expect(commandHandler.getAllTempAction).not.toHaveBeenCalled();

    // Second call should skip initialization since fields are already set
    jest.clearAllMocks();
    await transform('<xfdf><pdf-info></pdf-info><fields></fields></xfdf>', [1], jest.fn());
    // Should not re-initialize
    expect(commandHandler.getAllTempAction).not.toHaveBeenCalled();
  });

  describe('page manipulation integration tests', () => {
    it('should update annotation page numbers when MOVE_PAGE manipulation is applied (forward)', async () => {
      // Move page 1 to position 3 (0-indexed: from 0 to 2)
      const docWithMovePage = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'MOVE_PAGE', option: { pagesToMove: 1, insertBeforePage: 3 } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1" page="0"/>
            <text name="annot2" page="1"/>
            <text name="annot3" page="2"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithMovePage as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      const resultXml = callback.mock.calls[0][0];
      // Page 0 moves to 2, page 1 shifts to 0, page 2 shifts to 1
      expect(resultXml).toContain('name="annot1" page="2"');
      expect(resultXml).toContain('name="annot2" page="0"');
      expect(resultXml).toContain('name="annot3" page="1"');
    });

    it('should update annotation page numbers when MOVE_PAGE manipulation is applied (backward)', async () => {
      // Move page 3 to position 1 (0-indexed: from 2 to 0)
      const docWithMovePage = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'MOVE_PAGE', option: { pagesToMove: 3, insertBeforePage: 1 } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1" page="0"/>
            <text name="annot2" page="1"/>
            <text name="annot3" page="2"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithMovePage as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      const resultXml = callback.mock.calls[0][0];
      // Page 2 moves to 0, page 0 shifts to 1, page 1 shifts to 2
      expect(resultXml).toContain('name="annot1" page="1"');
      expect(resultXml).toContain('name="annot2" page="2"');
      expect(resultXml).toContain('name="annot3" page="0"');
    });

    it('should remove annotations and shift page numbers when REMOVE_PAGE manipulation is applied', async () => {
      // Remove page 2 (0-indexed: 1)
      const docWithRemovePage = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'REMOVE_PAGE', option: { pagesRemove: [2] } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1" page="0"/>
            <text name="annot2" page="1"/>
            <text name="annot3" page="2"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithRemovePage as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      const resultXml = callback.mock.calls[0][0];
      // Page 0 unchanged, page 1 removed, page 2 shifts to 1
      expect(resultXml).toContain('name="annot1" page="0"');
      expect(resultXml).not.toContain('name="annot2"'); // removed
      expect(resultXml).toContain('name="annot3" page="1"');
    });

    it('should remove multiple annotations when multiple pages are removed', async () => {
      // Remove pages 1 and 3 (0-indexed: 0 and 2)
      const docWithRemovePages = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'REMOVE_PAGE', option: { pagesRemove: [1, 3] } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1" page="0"/>
            <text name="annot2" page="1"/>
            <text name="annot3" page="2"/>
            <text name="annot4" page="3"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithRemovePages as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      const resultXml = callback.mock.calls[0][0];
      // Page 0 removed, page 1 shifts to 0, page 2 removed, page 3 shifts to 1
      expect(resultXml).not.toContain('name="annot1"'); // removed
      expect(resultXml).toContain('name="annot2" page="0"');
      expect(resultXml).not.toContain('name="annot3"'); // removed
      expect(resultXml).toContain('name="annot4" page="1"');
    });

    it('should shift annotation page numbers when INSERT_BLANK_PAGE manipulation is applied', async () => {
      // Insert blank page at position 2 (0-indexed: 1)
      const docWithInsertPage = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'INSERT_BLANK_PAGE', option: { insertPages: [2] } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1" page="0"/>
            <text name="annot2" page="1"/>
            <text name="annot3" page="2"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithInsertPage as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      const resultXml = callback.mock.calls[0][0];
      // Page 0 unchanged, page 1 shifts to 2, page 2 shifts to 3
      expect(resultXml).toContain('name="annot1" page="0"');
      expect(resultXml).toContain('name="annot2" page="2"');
      expect(resultXml).toContain('name="annot3" page="3"');
    });

    it('should shift annotations by multiple pages when multiple blank pages are inserted', async () => {
      // Insert 3 blank pages at position 1 (0-indexed: 0)
      const docWithInsertPages = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'INSERT_BLANK_PAGE', option: { insertPages: [1, 2, 3] } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1" page="0"/>
            <text name="annot2" page="1"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithInsertPages as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      const resultXml = callback.mock.calls[0][0];
      // All pages shift up by 3
      expect(resultXml).toContain('name="annot1" page="3"');
      expect(resultXml).toContain('name="annot2" page="4"');
    });

    it('should apply multiple manipulation steps in sequence', async () => {
      // First move page 1 to 3, then insert blank page at position 1
      const docWithMultipleSteps = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'MOVE_PAGE', option: { pagesToMove: 1, insertBeforePage: 3 } },
          { type: 'INSERT_BLANK_PAGE', option: { insertPages: [1] } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1" page="0"/>
            <text name="annot2" page="1"/>
            <text name="annot3" page="2"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithMultipleSteps as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      const resultXml = callback.mock.calls[0][0];
      // After MOVE_PAGE: page 0->2, page 1->0, page 2->1
      // After INSERT_BLANK_PAGE at 0: all pages shift up by 1
      // Final: annot1 (was 0->2->3), annot2 (was 1->0->1), annot3 (was 2->1->2)
      expect(resultXml).toContain('name="annot1" page="3"');
      expect(resultXml).toContain('name="annot2" page="1"');
      expect(resultXml).toContain('name="annot3" page="2"');
    });

    it('should not include ROTATE_PAGE in manipulation steps for annotation transformation', async () => {
      // ROTATE_PAGE should be executed but not stored for annotation page transformation
      const docWithRotate = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'ROTATE_PAGE', option: { pageNumber: 1, rotation: 90 } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1" page="0"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithRotate as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      const resultXml = callback.mock.calls[0][0];
      // Page should remain unchanged since ROTATE_PAGE doesn't affect page numbers
      expect(resultXml).toContain('name="annot1" page="0"');
    });

    it('should handle annotations without page attribute gracefully', async () => {
      const docWithMovePage = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'MOVE_PAGE', option: { pagesToMove: 1, insertBeforePage: 2 } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots>
            <text name="annot1"/>
            <text name="annot2" page="0"/>
          </annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithMovePage as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      // Should complete without error
      expect(callback).toHaveBeenCalled();
    });

    it('should handle empty annots element with manipulation steps', async () => {
      const docWithMovePage = {
        ...mockCurrentDocument,
        manipulationStep: JSON.stringify([
          { type: 'MOVE_PAGE', option: { pagesToMove: 1, insertBeforePage: 2 } }
        ]),
      };

      const mockXfdf = `
        <xfdf>
          <annots></annots>
        </xfdf>
      `;

      const transform = setInternalAnnotationTransform({
        currentDocument: docWithMovePage as any,
        usedImageRemoteIds: new Set(),
        setImageSignedUrlMap: jest.fn(),
        isOffline: false,
        isRemoteDocument: false,
      });

      const callback = jest.fn();
      await transform(mockXfdf, [1], callback);

      // Should complete without error
      expect(callback).toHaveBeenCalled();
    });
  });
});