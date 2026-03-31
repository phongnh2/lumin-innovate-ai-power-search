import { ComponentType } from 'react';

declare function withRightClickDocument<P>(WrappedComponent: ComponentType<P>): ComponentType<P>;

export default withRightClickDocument;
