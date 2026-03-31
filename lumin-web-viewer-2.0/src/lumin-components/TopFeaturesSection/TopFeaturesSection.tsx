import classNames from 'classnames';
import useEmblaCarousel from 'embla-carousel-react';
import { IconButton } from 'lumin-ui/kiwi-ui';
import React, { useCallback } from 'react';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { UploadPDF, EditPDF, GetSignatures, FindTemplate, WriteMyAgreement } from './components';
import { SignUploadContainer } from './components/GetSignatures';
import { TopFeaturesSectionProvider } from './context/TopFeaturesSectionContext';

import styles from './TopFeaturesSection.module.scss';

const TopFeaturesSectionInner = () => {
  const { isVisible: isChatbotOpened } = useChatbotStore();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    watchDrag: false,
    containScroll: 'keepSnaps',
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    };
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  return (
    <div className={styles.container}>
      <div className={classNames(styles.featureItems, { [styles.chatbotOpened]: isChatbotOpened })}>
        <IconButton
          id="prev-feature-item"
          icon="ph-caret-left"
          size="lg"
          className={styles.prevButton}
          onClick={scrollPrev}
        />
        <div className={styles.emblaContainer} ref={emblaRef}>
          <div className={styles.emblaSlides}>
            <div className={styles.emblaSlide}>
              <UploadPDF />
            </div>
            <div className={styles.emblaSlide}>
              <WriteMyAgreement />
            </div>
            <div className={styles.emblaSlide}>
              <EditPDF />
            </div>
            <div className={styles.emblaSlide}>
              <GetSignatures />
            </div>
            <div className={styles.emblaSlide}>
              <FindTemplate />
            </div>
          </div>
        </div>
        <IconButton
          id="next-feature-item"
          icon="ph-caret-right"
          size="lg"
          className={styles.nextButton}
          onClick={scrollNext}
        />
      </div>
    </div>
  );
};

const TopFeaturesSection = () => (
  <TopFeaturesSectionProvider>
    <div>
      <SignUploadContainer />
      <TopFeaturesSectionInner />
    </div>
  </TopFeaturesSectionProvider>
);

export default TopFeaturesSection;
