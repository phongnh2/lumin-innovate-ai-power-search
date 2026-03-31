import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import SummarizeSparkles from 'assets/images/summarize-sparkles.svg';

import { useGetExistingSummarize } from 'features/DocumentSummarization/hooks/useGetExistingSummarize';

import SummarizationCopy from './SummarizationCopy';
import SummarizationFeedback from './SummarizationFeedback';

import * as Styled from './SummarizationResult.styled';

const SummarizationResult = () => {
  const { existingSummarize } = useGetExistingSummarize();

  const markdownRef = useRef<HTMLDivElement>(null);

  const [currentMarkdown, setCurrentMarkdown] = useState<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentMarkdown(markdownRef.current);
  }, [existingSummarize]);

  return (
    <Styled.ResultWrapper>
      {existingSummarize && (
        <>
          <Styled.ResultGroup>
            <Styled.Image src={SummarizeSparkles} alt="summarize-sparkles" />
            <Styled.ResultMain>
              <Styled.SummarizeData ref={markdownRef}>
                <ReactMarkdown>{existingSummarize.content}</ReactMarkdown>
              </Styled.SummarizeData>
              <SummarizationCopy summarizedRef={currentMarkdown} />
            </Styled.ResultMain>
          </Styled.ResultGroup>
          <SummarizationFeedback />
        </>
      )}
    </Styled.ResultWrapper>
  );
};

export default SummarizationResult;
