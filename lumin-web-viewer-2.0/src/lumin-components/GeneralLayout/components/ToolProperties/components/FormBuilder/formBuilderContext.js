import React, { useContext } from 'react';

const FormBuilderContext = React.createContext();

export const useFormBuilderContext = () => useContext(FormBuilderContext);

export default FormBuilderContext;
