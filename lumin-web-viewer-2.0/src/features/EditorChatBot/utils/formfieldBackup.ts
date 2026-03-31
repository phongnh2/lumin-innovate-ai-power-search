import core from 'core';

class FormFieldBackup {
  private formField: Core.Annotations.TextWidgetAnnotation[] = [];

  backup() {
    this.formField = core
      .getAnnotationsList()
      .filter((annot) => annot instanceof Core.Annotations.TextWidgetAnnotation);
  }

  restore() {
    if (this.formField.length) {
      this.formField.forEach((field) => {
        core.getAnnotationManager().redrawAnnotation(field);
      });

      this.clear();
    }
  }

  clear() {
    this.formField = [];
  }
}

const formFieldBackup = new FormFieldBackup();

export default formFieldBackup;
