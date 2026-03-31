import { yupResolver } from '@hookform/resolvers/yup';
import { FieldValues, Resolver, useForm as useFormBase, UseFormProps } from 'react-hook-form';
import { Schema } from 'yup';

type CustomHookFormProps = {
  schema: Schema;
};

const useForm = <TFieldValues extends FieldValues = FieldValues, TContext = any>(props: UseFormProps<TFieldValues, TContext> & CustomHookFormProps) => {
  const { schema, ...otherProps } = props;
  return useFormBase<TFieldValues, TContext>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    resolver: yupResolver(schema) as Resolver<TFieldValues, TContext>,
    ...otherProps
  });
};

export default useForm;
