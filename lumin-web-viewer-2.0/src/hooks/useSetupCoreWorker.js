import { isEmpty } from 'lodash';
import { useEffect } from 'react';

export function useSetupCoreWorker() {
  useEffect(() => {
    import('core').then(({ default: core }) => {
      if (isEmpty(core.CoreControls)) {
        core.setUpWorker();
      }
    });
  }, []);
}
