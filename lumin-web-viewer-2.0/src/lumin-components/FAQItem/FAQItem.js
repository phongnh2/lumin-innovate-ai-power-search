import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import Icomoon from 'lumin-components/Icomoon';

import { Colors } from 'constants/styles';

import * as Styled from './FAQItem.styled';

const propTypes = {
  question: PropTypes.string,
  answer: PropTypes.node,
};

const defaultProps = {
  question: '',
  answer: null,
};

const FAQItem = ({ question, answer }) => {
  const answerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState('0px');
  const handleClickContainer = () => {
    setIsOpen(!isOpen);
    setMaxHeight(!isOpen ? `${answerRef.current.scrollHeight}px` : '0px');
  };
  return (
    <Styled.Container isOpen={isOpen}>
      <Styled.Item onClick={handleClickContainer}>
        <Styled.Text>{question}</Styled.Text>
        <Icomoon
          className={isOpen ? 'minus' : 'plus-thin'}
          size={16}
          color={Colors.NEUTRAL_100}
        />
      </Styled.Item>
      <Styled.AnswerWrapper ref={answerRef} style={{ maxHeight }}>
        <Styled.Answer>{answer}</Styled.Answer>
      </Styled.AnswerWrapper>
    </Styled.Container>
  );
};

FAQItem.propTypes = propTypes;
FAQItem.defaultProps = defaultProps;

export default FAQItem;
