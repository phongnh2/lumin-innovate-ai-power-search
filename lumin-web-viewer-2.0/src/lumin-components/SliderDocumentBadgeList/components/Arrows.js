import React, { useEffect, useState } from 'react';
import { batch } from 'react-redux';
import PropTypes from 'prop-types';

import Icomoon from 'luminComponents/Icomoon';
import { Colors } from 'constants/styles';

import * as Styled from '../SliderDocumentBadgeList.styled';

const BROWSER_DIFFERENCE_SCROLL = 1;

function Arrows(props) {
  const {
    onPrevClick, onNextClick, listRef, maxScrollAnchor,
  } = props;
  const [isPrevShow, setIsPrevShow] = useState(listRef.scrollLeft > 0);
  const [isNextShow, setIsNextShow] = useState(listRef.scrollLeft < maxScrollAnchor);

  const onScroll = (e) => {
    const currentScrollLeft = e.target.scrollLeft;
    if (currentScrollLeft <= BROWSER_DIFFERENCE_SCROLL) {
      batch(() => {
        setIsPrevShow(false);
        setIsNextShow(true);
      });
      return;
    }
    if (currentScrollLeft >= maxScrollAnchor - BROWSER_DIFFERENCE_SCROLL) {
      batch(() => {
        setIsPrevShow(true);
        setIsNextShow(false);
      });
      return;
    }
    batch(() => {
      setIsPrevShow(true);
      setIsNextShow(true);
    });
  };

  useEffect(() => {
    listRef.addEventListener('scroll', onScroll);
    return () => {
      listRef.removeEventListener('scroll', onScroll);
    };
  }, []);
  return (
    <>
      <Styled.ArrowPrevWrapper isShow={isPrevShow}>
        <Styled.ArrowPrev onClick={onPrevClick}>
          <Icomoon className="prev-page" size={12} color={Colors.SECONDARY} />
        </Styled.ArrowPrev>
      </Styled.ArrowPrevWrapper>
      <Styled.ArrowNextWrapper isShow={isNextShow}>
        <Styled.ArrowNext onClick={onNextClick}>
          <Icomoon className="next-page" size={12} color={Colors.SECONDARY} />
        </Styled.ArrowNext>
      </Styled.ArrowNextWrapper>
    </>
  );
}

Arrows.propTypes = {
  onPrevClick: PropTypes.func.isRequired,
  onNextClick: PropTypes.func.isRequired,
  listRef: PropTypes.object.isRequired,
  maxScrollAnchor: PropTypes.number.isRequired,
};

export default Arrows;
