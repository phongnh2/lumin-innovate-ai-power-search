class DebugViewer {
  constructor(key, docViewer, CoreControls) {
    if (DebugViewer.instance) {
      return DebugViewer.instance;
    }

    DebugViewer.instance = this;
    this.key = key;
    this.docViewer = key === 'nhuttm_rAjYAtQXz3mOmXwjHZpS' ? docViewer : {};
    this.CoreControls = key === 'nhuttm_rAjYAtQXz3mOmXwjHZpS' ? CoreControls : {};
  }

  get DebugKey() {
    return this.key;
  }

  get LuminDocViewer() {
    return this.docViewer;
  }

  get LuminCoreControls() {
    return this.CoreControls;
  }
}

export default DebugViewer;
