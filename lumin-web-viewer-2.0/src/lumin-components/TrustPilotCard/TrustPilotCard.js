import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import StarReview from 'lumin-components/StarReview';
import halfStar from 'assets/images/half-star-trust-pilot.svg';
import {
  StyledContainer,
  StyledWrapperAuthor,
  StyledAuthor,
  StyledAvatar,
  StyledInfo,
  StyledName,
  StyledCountry,
  StyledLabel,
  StyledContent,
  StyledButton,
  StyledWrapperStar,
  StyledText,
} from './TrustPilotCard.styled';

const MAX_LINE_CLAMP = 4;

const TrustPilotCard = React.forwardRef(({
  index, name, country, label, content, fullContent, handleToggle, maxHeight,
}, ref) => {
  const titleRef = useRef(null);
  const [contentLines, setContentLines] = useState(null);
  const truncateContent = (string) => (fullContent ? string : `${string.substring(0, 120)}...`);
  const showMoreContent = () => {
    handleToggle(index);
  };

  const getLines = () => {
    if (!titleRef.current) {
      return MAX_LINE_CLAMP;
    }
    const { clientHeight } = titleRef.current;
    return MAX_LINE_CLAMP - Math.ceil(clientHeight / (18 * 1.33));
  };

  useEffect(() => {
    if (maxHeight) {
      setTimeout(() => {
        const line = getLines();
        setContentLines(line);
      }, 100);
    }
  }, [contentLines, maxHeight]);

  return (
    <StyledContainer
      ref={ref}
      isShowFullContent={fullContent}
      index={index}
      style={{
        maxHeight,
      }}
    >
      <StyledWrapperAuthor>
        <StyledAuthor>
          <StyledAvatar src={halfStar} alt="avatar reviewer" />
          <StyledInfo>
            <StyledName>{name}</StyledName>
            <StyledCountry>{country}</StyledCountry>
          </StyledInfo>
        </StyledAuthor>
        <StyledWrapperStar>
          <StarReview numberStar={5} size={24} />
        </StyledWrapperStar>
      </StyledWrapperAuthor>

      <StyledLabel ref={titleRef}>{label}</StyledLabel>

      <StyledContent>
        <StyledText
          fullContent={fullContent}
          numOfLines={contentLines}
        >
          {truncateContent(content)}
        </StyledText>
        {' '}
        <StyledButton onClick={showMoreContent}>
          {fullContent ? 'Less' : 'More'}
        </StyledButton>
      </StyledContent>
    </StyledContainer>
  );
});

TrustPilotCard.propTypes = {
  index: PropTypes.number,
  name: PropTypes.string,
  country: PropTypes.string,
  label: PropTypes.string,
  content: PropTypes.string,
  fullContent: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
  maxHeight: PropTypes.number,
};
TrustPilotCard.defaultProps = {
  index: 0,
  name: '',
  country: '',
  label: '',
  content: '',
  maxHeight: null,
};

export default TrustPilotCard;
