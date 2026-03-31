import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import CommentContext from 'luminComponents/NoteCommentBox/CommentContext';

import './NoteCommentBox.scss';
import { lazyWithRetry } from 'utils/lazyWithRetry';

const NoteLumin = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/NoteLumin'));

const propTypes = {
  annotation: PropTypes.object.isRequired,
  onResize: PropTypes.func.isRequired,
};

const MIN_HEIGHT = 78;

const NoteCommentBox = ({ annotation, onResize }) => {
  const { isSelected } = useContext(CommentContext);
  const top = useSelector((state) => selectors.getCommentPos(state, annotation.Id));
  const [show, setShow] = useState(false);
  const [minHeight, setMinHeight] = useState(MIN_HEIGHT);
  const resizeObserver = useRef();
  const intersectionObserver = useRef();
  const containerRef = useRef();
  const innerRef = useRef();

  useEffect(() => {
    resizeObserver.current = new ResizeObserver(resizeObserverHandler);
    resizeObserver.current.observe(containerRef.current);

    intersectionObserver.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
        } else {
          if (innerRef.current) {
            setMinHeight(innerRef.current.offsetHeight);
          }
          setShow(false);
        }
      },
    );
    if (containerRef.current) {
      intersectionObserver.current.observe(containerRef.current);
    }

    // eslint-disable-next-line no-use-before-define
    core.addEventListener('annotationChanged', onAnnotationContentUpdate);
    return () => {
      // eslint-disable-next-line no-use-before-define
      core.removeEventListener('annotationChanged', onAnnotationContentUpdate);
      resizeObserver.current.disconnect();
      intersectionObserver.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (innerRef.current && !isSelected) {
      setMinHeight(innerRef.current.offsetHeight);
    }
  }, [isSelected]);

  const onAnnotationContentUpdate = async (annotationUpdated) => {
    if (
      annotationUpdated?.[0] &&
      annotation &&
      annotationUpdated[0].Id === annotation.Id
    ) {
      onResize();
    }
  };

  function resizeObserverHandler(entries) {
    entries.forEach((entry) => {
      if (entry.contentBoxSize || entry.contentRect) {
        onResize();
      }
    });
  }

  const noteStyle = {
    zIndex: isSelected ? 2 : 1,
    top: top || window.innerHeight * 2,
    opacity: ((!annotation.getContents() && !top) || !show) ? 0 : 1,
    minHeight,
  };

  const NoteCommentBoxClass = classNames({
    NoteCommentBox: true,
    'with-transition': annotation.getContents(),
  });

  return (
    <div ref={containerRef} className={NoteCommentBoxClass} id={annotation.Id} style={noteStyle}>
      {show && <div ref={innerRef}><NoteLumin annotation={annotation} isCommentPanel/></div> }
    </div>);
};

NoteCommentBox.propTypes = propTypes;
export default NoteCommentBox;
