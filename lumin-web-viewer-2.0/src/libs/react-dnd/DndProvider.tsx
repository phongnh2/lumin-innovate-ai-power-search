import React from 'react';
import { DndProvider as ReactDndProvider, DndProviderProps as ReactDndProviderProps } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type DndProviderProps = Omit<ReactDndProviderProps<unknown, unknown>, 'children' | 'backend' | 'context'> & {
  children: React.ReactNode;
};

const DndProvider = ({ children, ...props }: DndProviderProps) => (
  <ReactDndProvider backend={HTML5Backend} context={window} {...props}>
    {children}
  </ReactDndProvider>
);

export default DndProvider;
