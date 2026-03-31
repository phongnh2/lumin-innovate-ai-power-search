import { Store } from 'redux';

import { RootState } from 'store';

declare const onLocationSelected: (
  store: Store<RootState>
) => (
  pageCoordinates: Core.Tools.PageCoordinate,
  signatureWidget?: Core.Annotations.SignatureWidgetAnnotation
) => Promise<void>;

export default onLocationSelected;
