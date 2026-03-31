import actions from 'actions';
import core from 'core';

import defaultTool from 'constants/defaultTool';

import DataElements from './dataElement';

// import DataElements from './dataElement';

const onClick = (update, state, dispatch) => {
  core.deselectAllAnnotations();
  core.setToolMode(defaultTool);
  dispatch(actions.toggleElement('signatureOverlay'));
};

export default {
  signatureToolButton: {
    initialState: 'newSignature',
    mount: (update) => {
      const signatureTool = core.getTool('AnnotationCreateSignature');
      signatureTool.addEventListener('saveDefault.sigTool', () => {
        update('defaultSignature');
      });
      signatureTool.addEventListener('noDefaultSignatures.default', () => {
        update('newSignature');
      });
    },
    didUpdate: (prevProps, currProps, prevState, currState, update) => {
      if (prevProps.openElements !== currProps.openElements) {
        update();
      }
    },
    unmount: () => {
      const signatureTool = core.getTool('AnnotationCreateSignature');
      signatureTool.removeEventListener('saveDefault.sigTool');
      signatureTool.removeEventListener('noDefaultSignatures.default');
    },
    states: {
      toolName: 'signature',
      newSignature: {
        icon: 'tool-signature',
        onClick,
        title: 'annotation.signature',
        // we also consider if signatureOverlay is open in this state because there can be a case where all the default signatures are deleted
        // when signatureOverlay is open and this button's state will become "newSignature"
        isActive: ({ openElements }) => openElements.signatureModal || openElements.signatureOverlay,
      },
      defaultSignature: {
        icon: 'tool-signature',
        onClick,
        title: 'annotation.signature',
        isActive: ({ openElements }) => openElements.signatureOverlay,
      },
    },
  },
  rubberStampToolButton: {
    initialState: 'rubberStampAnnotation',
    states: {
      toolName: 'rubberStamp',
      rubberStampAnnotation: {
        icon: 'tool-rubber-stamp',
        onClick: (update, state, dispatch) => {
          core.deselectAllAnnotations();
          dispatch(actions.toggleElement(DataElements.RUBBER_STAMP_OVERLAY));
        },
        title: 'annotation.rubberStamp',
        // we also consider if signatureOverlay is open in this state because there can be a case where all the default signatures are deleted
        // when signatureOverlay is open and this button's state will become "newSignature"
        isActive: ({ openElements }) => openElements.rubberStampOverlay,
      },
    },
  },
};
