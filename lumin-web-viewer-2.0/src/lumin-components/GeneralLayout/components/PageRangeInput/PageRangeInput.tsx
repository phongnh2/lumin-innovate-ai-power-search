import { TextInput } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import { motionVariants, motionTransition } from './motions';
import { validateRangeFormatExpression } from './utils/range-validation';

import styles from './PageRangeInput.module.scss';

export interface PageRangeInputProps {
  value?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  enableAnimation?: boolean;
  style?: React.CSSProperties;
  onChange?: (value: string, isValid: boolean) => void;
  onBlur?: (value: string, isValid: boolean, errorMessage: string) => void;
}

const PageRangeInput = ({
  value = '',
  style,
  label,
  disabled = false,
  error: externalError,
  enableAnimation = false,
  placeholder = 'e.g. 1-3, 5, 7-9',
  onBlur,
  onChange,
}: PageRangeInputProps) => {
  const { t } = useTranslation();
  const [internalError, setInternalError] = useState<string>('');
  const totalPages = useSelector(selectors.getTotalPages);

  const containerProps = !enableAnimation
    ? { className: styles.container, style }
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
        exit: 'exit' as const,
        variants: motionVariants,
        transition: motionTransition,
        className: styles.container,
        style,
      };
  const Container = !enableAnimation ? 'div' : motion.div;

  const displayError = externalError || internalError;

  const isValidInput = useCallback((input: string): boolean => {
    const numericAndCommaDashRegex = /^[\d,\-\s]*$/;
    return numericAndCommaDashRegex.test(input);
  }, []);

  const validateRangeExpression = useCallback(
    (inputValue: string): string => {
      if (!validateRangeFormatExpression(inputValue)) {
        return t('errorMessage.generalInvalid') || 'Invalid format';
      }
      if (inputValue.split(',').some((page) => parseInt(page) > totalPages)) {
        return t('viewer.pageTools.pageRangeExceedTotalPage') || 'Page range exceeds total pages';
      }
      return '';
    },
    [totalPages, t]
  );

  const isValidRangeExpression = useCallback(
    (inputValue: string): boolean => validateRangeExpression(inputValue) === '',
    [validateRangeExpression]
  );

  const validateDocumentPage = useCallback(
    (inputValue: string): boolean => {
      const splitValues = inputValue.split(',');

      return splitValues.every((subValue) => {
        const trimmedValue = subValue.trim();
        if (!trimmedValue) {
          return true;
        }

        const subRangeArray = trimmedValue.split('-');
        const startPage = parseInt(subRangeArray[0]);
        const endPage = subRangeArray[1] ? parseInt(subRangeArray[1]) : startPage;

        return !(
          startPage > totalPages ||
          endPage > totalPages ||
          startPage === 0 ||
          endPage === 0 ||
          startPage > endPage ||
          Number.isNaN(startPage) ||
          Number.isNaN(endPage)
        );
      });
    },
    [totalPages]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      if (!isValidInput(newValue)) {
        return;
      }

      setInternalError('');

      const isValidExpression = isValidRangeExpression(newValue) && validateDocumentPage(newValue) && !!newValue;

      onChange?.(newValue, isValidExpression);
    },
    [isValidInput, onChange, validateDocumentPage, isValidRangeExpression]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const blurValue = event.target.value.trim();

      const formatError = validateRangeExpression(blurValue);
      let isValidDocument = true;
      let finalErrorMessage = '';

      if (formatError === '' && blurValue) {
        isValidDocument = validateDocumentPage(blurValue);
        if (!isValidDocument) {
          finalErrorMessage = t('errorMessage.invalidPagePosition') || 'Invalid page position';
        }
      } else {
        finalErrorMessage = formatError;
      }

      const isValid = finalErrorMessage === '' && !!blurValue;

      setInternalError(finalErrorMessage);
      onBlur?.(blurValue, isValid, finalErrorMessage);
    },
    [onBlur, t, validateDocumentPage, validateRangeExpression]
  );

  return (
    <Container {...containerProps}>
      <div className={styles.wrapper}>
        <TextInput
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          label={label}
          error={displayError}
          disabled={disabled}
          data-cy="page_range_input"
        />
      </div>
    </Container>
  );
};

export default PageRangeInput;
