import { isNil } from 'lodash';
import lodashRange from 'lodash/range';
import { Button, Icomoon, Menu, MenuItem } from 'lumin-ui/kiwi-ui';
import React, { useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import useToolChecker from 'lumin-components/GeneralLayout/hooks/useToolChecker';

import { useCleanup } from 'hooks/useCleanup';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { useCheckExploringFeature } from 'features/EnableToolFromQueryParams/hooks/useExploringFeature';

import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import RangeInputGroup, { RangeItem } from './components/RangeInputGroup';
import SplitByPageSection from './components/SplitByPageSection';
import { SplitBy, useExtractPages } from './hooks/useExtractPages';
import { useSplitByPageHandler } from './hooks/useSplitByPageHandler';

import styles from './SplitExtractPanel.module.scss';

const SplitExtractPanel = () => {
  const [ranges, setRanges] = useState<RangeItem[]>([
    {
      id: uuidv4(),
      value: '',
      errorMessage: '',
      isValidExpression: false,
    },
  ]);
  const [splitBy, setSplitBy] = useState<SplitBy>(SplitBy.RANGE);
  const {
    pageNumberPerFile,
    onChange: onPagePerFileChange,
    onBlur: onPagePerFileBlur,
    error: errorSplitByPage,
    isValid: isPageNumberPerFileValid,
  } = useSplitByPageHandler();

  const totalPages = useShallowSelector(selectors.getTotalPages);
  const { t } = useTranslation();
  const { isToolAvailable } = useToolChecker(TOOLS_NAME.SPLIT_PAGE);
  const isExploringFeature = useCheckExploringFeature({ pdfAction: PdfAction.SPLIT_PDF });
  const { extractPages } = useExtractPages({ splitBy });

  const isRangesValid = !ranges.map((subRange) => subRange.isValidExpression).includes(false);
  const canExtract = splitBy === SplitBy.RANGE ? isRangesValid : isPageNumberPerFileValid;

  const addMoreRange = (): void => {
    setRanges(
      ranges.concat({
        id: uuidv4(),
        value: '',
        errorMessage: '',
        isValidExpression: false,
      })
    );
  };

  const deleteRange = (id: string): void => {
    setRanges(ranges.filter((range) => range.id !== id));
  };

  const getPagesToExtractByRange = (): number[][] => {
    const pages: number[][] = [];
    ranges.forEach((range) => {
      const rangePerFile: number[] = [];

      const rangeValues = range.value.split(',');
      // eslint-disable-next-line no-restricted-syntax
      for (const rangeValue of rangeValues) {
        const arrRangeValue = rangeValue.split('-');
        if (arrRangeValue.length === 1) {
          rangePerFile.push(parseInt(rangeValue));
        } else {
          const subRange = lodashRange(parseInt(arrRangeValue[0]), parseInt(arrRangeValue[1]) + 1);
          rangePerFile.push(...subRange);
        }
      }
      pages.push(rangePerFile);
    });
    return pages;
  };

  const getPagesToExtractByPage = (): number[][] => {
    const pages: number[][] = [];
    for (let i = 1; i <= totalPages; i += Number(pageNumberPerFile)) {
      const endPage = Math.min(i + Number(pageNumberPerFile) - 1, totalPages);
      pages.push(lodashRange(i, endPage + 1));
    }
    return pages;
  };

  const handleChangeRangeValue = (value: string, isValid: boolean, id: string): void => {
    const updatedRanges = ranges.map((range) => {
      if (range.id === id) {
        return {
          ...range,
          value,
          errorMessage: '',
          isValidExpression: isValid,
        };
      }
      return range;
    });

    setRanges(updatedRanges);
  };

  const handleBlurRangeValue = (value: string, isValid: boolean, errorMessage: string, id: string): void => {
    const rangeIndex = ranges.findIndex((range) => range.id === id);
    if (rangeIndex === -1) return;

    const updatedRanges = [...ranges];
    updatedRanges[rangeIndex] = {
      ...updatedRanges[rangeIndex],
      value,
      isValidExpression: isValid,
      errorMessage,
    };

    setRanges(updatedRanges);
  };

  const handleExtractPage = async (): Promise<void> => {
    const pagesToExtract = splitBy === SplitBy.PAGE ? getPagesToExtractByPage() : getPagesToExtractByRange();
    await extractPages({
      pagesToExtract,
      ranges,
      toolName: TOOLS_NAME.SPLIT_PAGE,
      eventName: PremiumToolsPopOverEvent.SplitPage,
      isToolAvailable,
      isExploringFeature,
    });
  };

  const splitByRange = async (): Promise<void> => {
    const isValidToExtract = ranges.every((range) => range.isValidExpression && range.value.trim());

    if (isValidToExtract) {
      await handleExtractPage();
    }
  };

  const splitByPage = async (): Promise<void> => {
    if (isNil(pageNumberPerFile)) {
      return;
    }
    await handleExtractPage();
  };

  const handleClickExtract = async (): Promise<void> => {
    switch (splitBy) {
      case SplitBy.RANGE:
        await splitByRange();
        break;
      case SplitBy.PAGE:
        await splitByPage();
        break;
      default:
        break;
    }
  };

  const handleChangeSplitBy = (value: SplitBy): void => {
    setSplitBy(value);
  };

  const handleChangeSplitByPage = (value: string): void => {
    onPagePerFileChange(value);
  };

  const renderInputGroup = () => {
    switch (splitBy) {
      case SplitBy.RANGE:
        return (
          <>
            <RangeInputGroup
              ranges={ranges}
              onChangeRangeValue={handleChangeRangeValue}
              onBlurRangeValue={handleBlurRangeValue}
              onDeleteRange={deleteRange}
            />
            <Button
              className={styles.addRangeButton}
              startIcon={<Icomoon type="plus-md" size="md" />}
              variant="text"
              onClick={addMoreRange}
              data-cy="add_range_button"
            >
              {t('generalLayout.toolProperties.addRange')}
            </Button>
          </>
        );
      case SplitBy.PAGE:
        return (
          <SplitByPageSection
            onChange={handleChangeSplitByPage}
            value={pageNumberPerFile}
            onBlur={(e) => onPagePerFileBlur(e.target.value)}
            error={errorSplitByPage}
          />
        );
      default:
        return null;
    }
  };

  const splitData = useMemo(
    () => [
      {
        label: t('viewer.pageTools.splitByRange'),
        value: SplitBy.RANGE,
        description: t('viewer.pageTools.splitByRangeDesc'),
        icon: 'ph-file-text',
      },
      {
        label: t('viewer.pageTools.splitByNumberOfPages'),
        value: SplitBy.PAGE,
        description: t('viewer.pageTools.splitByNumberOfPagesDesc'),
        icon: 'ph-files',
      },
    ],
    [t]
  );

  useCleanup(() => {
    if (splitBy === SplitBy.RANGE) {
      setRanges(ranges.map((range) => ({ ...range, errorMessage: '' })));
    } else {
      onPagePerFileChange(null);
    }
  }, [splitBy]);

  return (
    <div className={styles.container}>
      <Menu
        position="bottom-start"
        ComponentTarget={
          <Button
            endIcon={<Icomoon type="ph-caret-down" size="sm" />}
            className={styles.splitBySelect}
            size="sm"
            variant="text"
            data-cy="split_by_dropdown"
          >
            {splitData.find((item) => item.value === splitBy)?.label}
          </Button>
        }
      >
        {splitData.map((item) => (
          <MenuItem
            leftIconProps={{
              type: item.icon,
              size: 'md',
            }}
            classNames={{
              itemSection: styles.menuItemIcon,
            }}
            key={item.value}
            onClick={() => handleChangeSplitBy(item.value)}
            activated={splitBy === item.value}
          >
            <h5 className={styles.menuItemTitle}>{item.label}</h5>
            <h6 className={styles.menuItemDesc}>{item.description}</h6>
          </MenuItem>
        ))}
      </Menu>
      <div className={styles.mainContent}>{renderInputGroup()}</div>

      {splitBy === SplitBy.PAGE && (
        <p className={styles.desc}>
          <Trans
            i18nKey="viewer.pageTools.splitByPageExample"
            components={{
              1: <code />,
            }}
          />
        </p>
      )}

      <Button
        className={styles.extractButton}
        size="lg"
        onClick={handleClickExtract}
        disabled={!canExtract}
        data-cy="extract_button"
      >
        {t('viewer.pageTools.extract')}
      </Button>
    </div>
  );
};

export default withValidUserCheck(SplitExtractPanel, TOOLS_NAME.SPLIT_PAGE);
