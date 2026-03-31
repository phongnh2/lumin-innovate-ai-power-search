import { IconButton } from "@/components/ui/icon-button";
import clsx from "clsx";
import { useRef, useState, useEffect } from "react";

import type { ICategory } from "@/interfaces/category.interface";
import categories from "@/mocks/category.json";

import Card from "../Card";

import styles from "./Carousel.module.scss";

const Carousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollPosition = () => {
    if (!carouselRef.current) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;

    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollPosition();

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) {
      return;
    }

    const scrollAmount = 280;
    const newScrollLeft =
      direction === "left"
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;

    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.categorySection}>
      <h2 className={styles.sectionTitle}>Explore category</h2>
      <div className={styles.carouselContainer}>
        {showLeftArrow && (
          <>
            <div className={styles.blurOverlayLeft} />
            <IconButton
              icon="chevron-left-xl"
              size="xl"
              className={clsx(styles.arrowButton, styles.arrowLeft)}
              onClick={() => scroll("left")}
              aria-label="Previous categories"
            />
          </>
        )}

        <div ref={carouselRef} className={styles.categoryCarousel}>
          {categories.map((category) => (
            <Card key={category.id} category={category as unknown as ICategory} />
          ))}
        </div>
        {showRightArrow && (
          <>
            <div className={styles.blurOverlayRight} />
            <IconButton
              icon="chevron-right-xl"
              size="xl"
              type="button"
              className={clsx(styles.arrowButton, styles.arrowRight)}
              onClick={() => scroll("right")}
              aria-label="Next categories"
            />
          </>
        )}
      </div>
    </section>
  );
};

export default Carousel;
