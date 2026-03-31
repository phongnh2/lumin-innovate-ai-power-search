/* eslint-disable max-classes-per-file */
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import head from 'lodash/head';
import remove from 'lodash/remove';

import { LocalStorageUtils } from 'utils';

import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { LocalStorageKey } from 'constants/localStorageKey';
import { SOCKET_EMIT } from 'constants/socketConstant';

import DATA_ELEMENT from './dataElement.constant';
import { socket } from '../../socket';

const INSERT = 'INSERT';
const DELETE = 'DELETE';
const MODIFY = 'MODIFY';
const CURRENT = 'CURRENT';

const STACK_LIMIT = 30;

const emitChangeAnnotation = ({ annotation, xfdf, currentDocument, currentUser, action }) => {
  if (!currentUser) {
    return;
  }
  socket.emit(SOCKET_EMIT.ANNOTATION_CHANGE, {
    roomId: currentDocument._id,
    xfdf,
    annotationId: annotation.Id,
    userId: currentUser._id,
    email: currentUser.email,
    pageIndex: annotation.PageNumber,
    annotationType: annotation.Subject,
    annotationAction: action,
  });
};

class Memento {
  constructor(annotationId, type, xfdf) {
    this.annotationId = annotationId;
    this.type = type;
    this.xfdf = xfdf;
  }
}

class InsertMemento extends Memento {
  constructor(annotationId, xfdf, annotManager, currentDocument, currentUser) {
    super(annotationId, INSERT, xfdf);
    this.annotManager = annotManager;
    this.currentDocument = currentDocument;
    this.currentUser = currentUser;
  }

  async draw() {
    const annotations = await this.annotManager.importAnnotationCommand(this.xfdf);
    if (annotations.length > 0) {
      this.annotManager.drawAnnotationsFromList(annotations);
      this.annotManager.trigger('annotationUpdated', [annotations, ANNOTATION_ACTION.ADD, {}]);
      if (this.currentUser) {
        const annotation = this.annotManager.getAnnotationById(this.annotationId);
        emitChangeAnnotation({
          annotation,
          xfdf: this.xfdf,
          currentDocument: this.currentDocument,
          currentUser: this.currentUser,
          action: ANNOTATION_ACTION.ADD,
        });
      }
    }
    // /* END */
  }
}

class DeleteMemento extends Memento {
  constructor(annotationId, xfdf, annotManager) {
    super(annotationId, DELETE, xfdf);
    this.annotManager = annotManager;
  }

  draw() {
    const annotation = this.annotManager.getAnnotationById(this.annotationId);
    this.annotManager.deleteAnnotation(annotation);
  }
}

class ModifyMemento extends Memento {
  constructor(annotationId, xfdf, annotManager, currentDocument, currentUser) {
    super(annotationId, MODIFY, xfdf);
    this.annotManager = annotManager;
    this.currentDocument = currentDocument;
    this.currentUser = currentUser;
  }

  async draw() {
    const annotations = await this.annotManager.importAnnotationCommand(this.xfdf);
    if (annotations.length > 0) {
      annotations.forEach((annot) => this.annotManager.redrawAnnotation(annot));
      this.annotManager.trigger('annotationUpdated', [annotations, ANNOTATION_ACTION.MODIFY, {}]);
      const annotation = this.annotManager.getAnnotationById(this.annotationId);
      if (!this.currentUser) {
        return;
      }
      emitChangeAnnotation({
        annotation,
        xfdf: this.xfdf,
        currentDocument: this.currentDocument,
        currentUser: this.currentUser,
        action: ANNOTATION_ACTION.MODIFY,
      });
    }
    /* END */
  }
}

class CurrentMemento extends Memento {
  constructor(annotationId, xfdf) {
    super(annotationId, CURRENT, xfdf);
  }
}

export class CareTaker {
  constructor(annotManager, actions) {
    this.initialStack = [];
    this.undoStack = [];
    this.redoStack = [];
    this.isUndoRedoing = false;
    this.annotManager = annotManager;
    this.types = new Map()
      .set(ANNOTATION_ACTION.ADD, DELETE)
      .set(ANNOTATION_ACTION.DELETE, INSERT)
      .set(ANNOTATION_ACTION.MODIFY, MODIFY);
    this.currentDocument = null;
    this.currentUser = null;
    this.actions = actions;
    this.disableUndoRedoButton();
  }

  backupAnnotation({ annotations, action, mapXfdf, currentDocument, currentUser, isEditOtherAnnotation = false }) {
    // currentDocument & currentUser are needed for someother actions
    this.currentDocument = currentDocument;
    this.currentUser = currentUser;
    if (this.isUndoRedoing) {
      return;
    }
    const type = this.typeResolver(action);
    const mementos = this.constructMementosFromAnnotation(annotations, type, mapXfdf);
    const currentAnnotations = type === MODIFY && this.constructMementosFromAnnotation(annotations, CURRENT, mapXfdf);
    if ([ANNOTATION_ACTION.MODIFY, ANNOTATION_ACTION.ADD].includes(action)) {
      const promptChangeAnnotOfOtherPeople = LocalStorageUtils.get({
        key: LocalStorageKey.SHOULD_HIDE_CHANGE_ANNOTATION_OF_OTHER_PEOPLE_PROMPT,
      });
      const promptData = JSON.parse(promptChangeAnnotOfOtherPeople || '[]');
      if (!isEditOtherAnnotation || promptData.includes(action)) {
        annotations.forEach((annot) => {
          // Update initialStack to remain the latest xfdf of annotation
          remove(this.initialStack, { annotationId: annot.Id });
          this.initialStack.push({ annotationId: annot.Id, xfdf: mapXfdf[annot.Id] });
        });
      }
    }
    const newStack = [...this.undoStack, mementos, currentAnnotations].filter(Boolean);
    this.undoStack = this.calculateUndoStack(newStack);
    this.actions.enableElement(DATA_ELEMENT.UNDO);
    this.isUndoRedoing = false;
  }

  // eslint-disable-next-line class-methods-use-this
  calculateUndoStack(rawStack) {
    const result = [];
    let index = rawStack.length - 1;
    let total = 0;

    while (index >= 0 && total < STACK_LIMIT) {
      const mementos = rawStack[index];

      result.push(mementos);

      // Current mementos and modify mementos are always go side by side and count as one stack
      if (mementos[0].type === CURRENT && index > 0) {
        result.push(rawStack[index - 1]);
        index -= 1;
      }

      index -= 1;
      total += 1;
    }

    return result.reverse();
  }

  typeResolver(action) {
    return this.types.get(action);
  }

  constructMementosFromAnnotation(annotations, type, mapXfdf) {
    return annotations.map((a) => this.constructMemento(a.Id, type, mapXfdf[a.Id]));
  }

  constructMemento(id, type, xfdf) {
    const cases = {
      INSERT: () => this.getLastXFDFById(id),
      DELETE: () => xfdf,
      MODIFY: () => this.getLastXFDFById(id),
      CURRENT: () => xfdf,
    };
    const content = cases[type]();
    this.redoStack = [];
    this.actions.disableElement(DATA_ELEMENT.REDO);
    return this.saveAnnotation(id, type, content);
  }

  getLastXFDFById(id) {
    const memento = [...this.initialStack, ...flatten(this.undoStack)].reverse().find((a) => a.annotationId === id);
    return memento && memento.xfdf;
  }

  saveAnnotation(id, type, xfdf) {
    const cases = {
      INSERT: () => new InsertMemento(id, xfdf, this.annotManager, this.currentDocument, this.currentUser),
      DELETE: () => new DeleteMemento(id, xfdf, this.annotManager),
      MODIFY: () => new ModifyMemento(id, xfdf, this.annotManager, this.currentDocument, this.currentUser),
      CURRENT: () => new CurrentMemento(id, xfdf),
    };
    return cases[type]();
  }

  undoAnnotation() {
    if (!this.undoStack.length) {
      return;
    }
    this.isUndoRedoing = true;
    this.actions.enableElement(DATA_ELEMENT.REDO);

    const mementos = this.undoStack.pop();
    if (this.currentDocument.isSystemFile) {
      this.actions.setCurrentDocument({ ...this.currentDocument, unsaved: true });
    }
    this.handleUndoRedo(mementos, true);
  }

  redoAnnotation() {
    if (!this.redoStack.length) {
      return;
    }
    this.isUndoRedoing = true;
    this.actions.enableElement(DATA_ELEMENT.UNDO);

    const memento = this.redoStack.pop();
    if (this.currentDocument.isSystemFile) {
      this.actions.setCurrentDocument({ ...this.currentDocument, unsaved: true });
    }
    this.handleUndoRedo(memento);
  }

  handleUndoRedo(mementos, isUndoing) {
    const cases = {
      INSERT: () => this.insertAnnotations(mementos, isUndoing),
      DELETE: () => this.deleteAnnotations(mementos, isUndoing),
      CURRENT: () => this.modifyAnnotations(mementos, isUndoing),
      null: () => {},
    };
    const type = get(head(mementos), 'type', null);
    cases[type]();
    setTimeout(() => (this.isUndoRedoing = false), 500);
    // this.isUndoRedoing = false;
  }

  insertAnnotations(mementos, isUndoing) {
    mementos.forEach((m) => m.draw());
    this.attachToOppositeStack(mementos, DELETE, isUndoing);
  }

  deleteAnnotations(mementos, isUndoing) {
    mementos.forEach((m) => m.draw());
    this.attachToOppositeStack(mementos, INSERT, isUndoing);
  }

  modifyAnnotations(mementos, isUndoing = false) {
    const cases = {
      0: 'redoStack',
      1: 'undoStack',
    };
    const newMementos = this[cases[Number(isUndoing)]].pop();
    newMementos?.forEach((m) => {
      m.draw();
      const { annotationId, xfdf } = m;
      remove(this.initialStack, { annotationId });
      this.initialStack.push({ annotationId, xfdf });
    });
    this.attachToOppositeStack(mementos, MODIFY, isUndoing);
    this.attachToOppositeStack(newMementos, CURRENT, isUndoing);
  }

  attachToOppositeStack(memento, type, isUndoing = false) {
    const attachNameStack = this.updateMementos(memento, type);
    const cases = {
      0: () => attachNameStack('undoStack'),
      1: () => attachNameStack('redoStack'),
    };
    cases[Number(isUndoing)]();
    this.disableButtonWhenStackEmpty(isUndoing);
  }

  updateMementos(mementos, type) {
    const newMementos = mementos.map((m) => this.saveAnnotation(m.annotationId, type, m.xfdf));
    return (stackName) => {
      this.attach(stackName, newMementos);
    };
  }

  attach(stackName, mementos) {
    this[stackName] = [...this[stackName], mementos];
  }

  disableUndoRedoButton() {
    this.actions.disableElement(DATA_ELEMENT.UNDO);
    this.actions.disableElement(DATA_ELEMENT.REDO);
  }

  disableButtonWhenStackEmpty(isUndoing = false) {
    if (this.undoStack.length && this.redoStack.length) {
      return;
    }
    if (isUndoing) {
      return this.actions.disableElement(DATA_ELEMENT.UNDO);
    }
    return this.actions.disableElement(DATA_ELEMENT.REDO);
  }

  clearUndoRedoStack() {
    this.undoStack = [];
    this.redoStack = [];
    this.disableUndoRedoButton();
  }

  removeMemento(annotations) {
    const annotationIds = annotations.map((annotation) => annotation.Id);

    this.undoStack = this.undoStack.filter(
      (mementoList) => mementoList.filter((memento) => !annotationIds.includes(memento.annotationId)).length > 0
    );
    if (this.undoStack.length < 1) {
      this.actions.disableElement(DATA_ELEMENT.UNDO);
    }
    this.redoStack = this.redoStack.filter(
      (mementoList) => mementoList.filter((memento) => !annotationIds.includes(memento.annotationId)).length > 0
    );
    if (this.redoStack.length < 1) {
      this.actions.disableElement(DATA_ELEMENT.REDO);
    }
  }
}
