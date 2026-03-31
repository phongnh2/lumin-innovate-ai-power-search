import { Store } from 'redux';

import { DataElement } from 'constants/dataElement';

export default function createFeatureAPI(
  enable: boolean,
  store: Store
): (features: DataElement[] | DataElement) => void;
