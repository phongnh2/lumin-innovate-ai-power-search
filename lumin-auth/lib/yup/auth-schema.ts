import { InferType } from 'yup';

import { yup, yupValidator } from './yup';

export const signUpSchema = yup
  .object()
  .shape({
    email: yupValidator.email,
    name: yupValidator.username,
    password: yupValidator.password,
    terms: yupValidator.terms
  })
  .required();

export const signInSchema = yup
  .object()
  .shape({
    email: yupValidator.email,
    password: yupValidator.password
  })
  .required();

export type TSignInSchema = InferType<typeof signInSchema>;

export type TSignUpSchema = InferType<typeof signUpSchema>;

export const emailSchema = yup
  .object()
  .shape({
    email: yupValidator.email
  })
  .required();

export type TEmailSchema = InferType<typeof emailSchema>;

export const passwordSchema = yup
  .object()
  .shape({
    newPassword: yupValidator.password
  })
  .required();

export type TPasswordSchema = InferType<typeof passwordSchema>;

export const forgotPasswordSchema = yup
  .object()
  .shape({
    email: yupValidator.email,
    token: yupValidator.reCaptcha
  })
  .required();

export type TForgotPasswordSchema = InferType<typeof forgotPasswordSchema>;

export const signInSSOSchema = yup
  .object()
  .shape({
    email: yupValidator.email
  })
  .required();

export type TSignInSSOSchema = InferType<typeof signInSSOSchema>;
