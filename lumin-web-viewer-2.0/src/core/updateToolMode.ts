/**
 * Sets tool mode.
 * @method WebViewerInstance#setToolMode
 * @param {string} toolName Name of the tool, either from <a href='https://www.pdftron.com/documentation/web/guides/annotations-and-tools/#list-of-tool-names' target='_blank'>tool names list</a> or the name you registered your custom tool with.
 * @example
WebViewer(...)
  .then(function(instance) {
    instance.setToolMode('AnnotationEdit');
  });
 */
import { Store, AnyAction } from 'redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { RootState } from '../redux/store';
import { ToolName } from './type';

const setActiveToolGroupAndToolsOverlay = (store: Store, group: string): void => {
  if (!group) {
    store.dispatch(actions.setActiveToolGroup('') as AnyAction);
    store.dispatch(actions.closeElement('toolsOverlay') as AnyAction);
  } else {
    store.dispatch(actions.setActiveToolGroup(group) as AnyAction);
    store.dispatch(actions.openElement('toolsOverlay') as AnyAction);
  }
};

export default (store: Store<RootState>, toolName: ToolName): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const state = store.getState();
  const { group = '' } = selectors.getToolButtonObject(state, toolName);

  core.setToolMode(toolName);
  setActiveToolGroupAndToolsOverlay(store, group);
};
