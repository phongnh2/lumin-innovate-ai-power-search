import { shortcutsMap } from "features/Freetext/shortcuts";

export const getCaretCharacterOffsetWithin = (element) => {
  let caretOffset = 0;
  const doc = element.ownerDocument || element.document;
  const win = doc.defaultView || doc.parentWindow;
  let sel;
  if (typeof win.getSelection !== "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      const range = win.getSelection().getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if (doc.selection !== 'Control') {
    sel = doc.selection;
    const textRange = sel.createRange();
    const preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
};

const turnOffShortcut = (key) => ({
  key,
  shortKey: true,
  handler() {},
});

export const turnOnShortcutOptions = () => ({
  modules: {
    keyboard: {
      bindings: {
        strike: turnOffShortcut('k'),
      },
    },
  },
});

export const turnOffShortcutOptions = () => ({
  modules: {
    keyboard: {
      bindings: shortcutsMap,
    },
  },
});