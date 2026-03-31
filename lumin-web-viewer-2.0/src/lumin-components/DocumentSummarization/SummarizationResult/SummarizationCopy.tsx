/* eslint-disable @typescript-eslint/no-floating-promises */
import { Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import Icomoon from 'luminComponents/Icomoon';

import { executeCopy } from 'utils/executeCopy';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { SummarizationDebounceActions } from 'features/DocumentSummarization/constants';

import * as Styled from './SummarizationResult.styled';

interface ISummarizationCopy {
  summarizedRef: HTMLDivElement;
}

const SummarizationCopy = (props: ISummarizationCopy) => {
  const { t } = useTranslation();

  const { summarizedRef } = props;

  const [copied, setCopied] = useState(false);

  const debounceRevertToCopy = useDebouncedCallback(() => setCopied(false), SummarizationDebounceActions.COPY);

  const onCopy = () => {
    debounceRevertToCopy.cancel();
    if (summarizedRef) {
      executeCopy({
        textHtml: summarizedRef.outerHTML,
        textPlain: summarizedRef.innerText,
      });
    }
    setCopied(true);
    debounceRevertToCopy();
  };

  return (
    <Styled.CopyButton>
      <PlainTooltip content={t('common.copy')} position="bottom">
        <Button
          data-lumin-btn-name={ButtonName.COPY_SUMMARY}
          startIcon={<Icomoon className={copied ? 'sm_circle_check_filled' : 'sm_copy'} />}
          iconSize="sm"
          variant="text"
          size="sm"
          onClick={onCopy}
        >
          {copied ? `${t('common.copied')}!` : t('common.copy')}
        </Button>
      </PlainTooltip>
    </Styled.CopyButton>
  );
};

export default SummarizationCopy;
