import React from 'react';
import { useKey } from 'react-use';

interface KeyEventProviderProps {
  children: React.ReactNode;
  close: () => void;
}

const KeyEventProvider = ({ children, close }: KeyEventProviderProps) => {
  useKey('Escape', close);

  return children;
};

export default KeyEventProvider;
