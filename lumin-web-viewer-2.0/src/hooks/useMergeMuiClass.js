import { useMemo } from 'react';
import merge from 'lodash/merge';
import classNames from 'classnames';

export function useMergeMuiClass({ materialClassNames, baseClasses, customClasses }) {
  return useMemo(() => {
    const newClasses = { ...baseClasses };
    materialClassNames.forEach((_classes) => {
      merge(newClasses, { [_classes]: classNames(baseClasses[_classes], customClasses[_classes]) });
    });
    return newClasses;
  }, [materialClassNames, baseClasses, customClasses]);
}
