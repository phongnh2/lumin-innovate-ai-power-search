import { v4 } from 'uuid';

export function configureDuplicateIdPrevention() {
  const duplicatedAnnots = new Set();
  window.Core.Annotations.setCustomSerializeHandler(
    window.Core.Annotations.Annotation,
    (originalElement, pageMatrix, options) => {
      const annot = options.annotation;
      const element = options.originalSerialize(originalElement, pageMatrix);
      const id = annot.Id;
      if (id) {
        if (duplicatedAnnots.has(id)) {
          // override duplicate ID in the XFDF element, not on the annot object
          element.setAttribute('name', v4());
        } else {
          duplicatedAnnots.add(id);
        }
      }
      return element;
    }
  );
}
