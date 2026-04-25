import { useCallback, useEffect, useRef, useState } from "react";

import { SkeletonItem } from "@/components/Skeleton";
import { Template } from "@/components/Template";

import { useFeaturedLegalContent } from "@/hooks/useFeaturedLegalContent";
import { useMostPopularInLumin } from "@/hooks/useTemplates";
import type { TemplatePageData } from "@/interfaces/api.interface";
import type { ITemplate } from "@/interfaces/template.interface";

import styles from "./LifeContent.module.scss";

const LifeContent = () => {
  const { data: featuredData } = useFeaturedLegalContent(3);
  const featuredTemplates = featuredData?.templates ?? [];

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useMostPopularInLumin();

  const observerRef = useRef<HTMLDivElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );

  const allTemplates =
    data?.pages.flatMap((p: TemplatePageData) => p.templates) ?? [];

  const handleClick = (id: number) => setSelectedTemplateId(id);
  const handleCloseModal = () => setSelectedTemplateId(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const heroCardClasses = [
    styles.heroCard0,
    styles.heroCard1,
    styles.heroCard2,
  ];

  return (
    <div className={styles.wrapper}>
      {/* Section 1: Hero banner */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h2 className={styles.heroTitle}>
            Templates for every moment of your life
          </h2>
          <p className={styles.heroSub}>
            From invitations to planners — discover designs for the moments that
            matter most.
          </p>
        </div>
        {featuredTemplates.length > 0 && (
          <div className={styles.heroVisual}>
            {featuredTemplates.slice(0, 3).map((t: ITemplate, i: number) => (
              <div key={t.id} className={heroCardClasses[i]}>
                <Template.Thumbnail
                  src={t.thumbnails[0]?.src ?? ""}
                  alt={t.title}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Template grid */}
      <section className={styles.gridSection}>
        {isLoading ? (
          <div className={styles.templateGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        ) : (
          <div className={styles.templateGrid}>
            {allTemplates.map((t) => (
              <Template.Item
                key={t.id}
                templateData={t as unknown as ITemplate}
                onClick={() => handleClick(Number(t.id))}
              />
            ))}
          </div>
        )}

        {isFetchingNextPage && (
          <div className={styles.templateGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonItem key={`sk-${i}`} />
            ))}
          </div>
        )}

        <div ref={observerRef} className={styles.loadTrigger} />
      </section>

      <Template.DetailModal
        isOpen={!!selectedTemplateId}
        templateId={selectedTemplateId ?? 0}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default LifeContent;
