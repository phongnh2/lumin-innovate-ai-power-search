/* eslint-disable @typescript-eslint/unbound-method */
export function configMeasureToolSerialization() {
  const originalSerialize = window.Core.Annotations.ArcAnnotation.prototype.serialize;
  const originalPolygonSerialize = window.Core.Annotations.PolygonAnnotation.prototype.serialize;
  const originalEllipseSerialize = window.Core.Annotations.EllipseAnnotation.prototype.serialize;

  const removeAppearanceTags = (element: Element): void => {
    const appearanceTags = element.querySelectorAll('appearance');
    appearanceTags.forEach((tag) => {
      tag.remove();
    });
  };

  window.Core.Annotations.ArcAnnotation.prototype.serialize = function (element: Element, _pageMatrix: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, prefer-rest-params
    element = originalSerialize.call(this, element, _pageMatrix);
    removeAppearanceTags(element);
    return element;
  };

  window.Core.Annotations.PolygonAnnotation.prototype.serialize = function (element: Element, _pageMatrix: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, prefer-rest-params
    element = originalPolygonSerialize.call(this, element, _pageMatrix);
    const isMeasureAnnotation = element.querySelector('measure');
    if (isMeasureAnnotation) {
      removeAppearanceTags(element);
    }
    return element;
  };

  window.Core.Annotations.EllipseAnnotation.prototype.serialize = function (element: Element, _pageMatrix: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, prefer-rest-params
    element = originalEllipseSerialize.call(this, element, _pageMatrix);
    const isMeasureAnnotation = element.querySelector('measure');
    if (isMeasureAnnotation) {
      removeAppearanceTags(element);
    }
    return element;
  };
}
