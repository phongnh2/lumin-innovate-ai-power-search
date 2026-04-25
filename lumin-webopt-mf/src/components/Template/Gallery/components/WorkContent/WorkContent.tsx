import { useCallback, useEffect, useRef, useState } from "react";

import { SkeletonItem } from "@/components/Skeleton";
import { Template } from "@/components/Template";

import { useFeaturedLegalContent } from "@/hooks/useFeaturedLegalContent";
import { useMostPopularInLumin, useNewInLumin } from "@/hooks/useTemplates";
import type { TemplatePageData } from "@/interfaces/api.interface";
import type { ITemplate } from "@/interfaces/template.interface";
import categories from "@/mocks/category.json";
import { getHighResThumbnail } from "@/utils/template";

import styles from "./WorkContent.module.scss";

const WorkContent = () => {
  const { data: featuredData, isLoading: featuredLoading } =
    useFeaturedLegalContent(3);
  const { data: newData, isLoading: newLoading } = useNewInLumin(6);
  const {
    data: popularData,
    isLoading: popularLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMostPopularInLumin();

  const observerRef = useRef<HTMLDivElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );

  const featuredTemplates = featuredData?.templates ?? [];
  const newTemplates = newData?.templates ?? [];
  const allPopular =
    popularData?.pages.flatMap((p: TemplatePageData) => p.templates) ?? [];

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

  return (
    <div className={styles.wrapper}>
      <section
        className={styles.section}
        style={{ "--delay": "0.08s" } as React.CSSProperties}
      >
        <h2 className={styles.sectionTitle}>Browse by category</h2>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <button key={cat.id} type="button" className={styles.categoryChip}>
              {cat.title}
            </button>
          ))}
        </div>
      </section>

      <section
        className={styles.section}
        style={{ "--delay": "0.16s" } as React.CSSProperties}
      >
        <h2 className={styles.sectionTitle}>Recently added</h2>
        <div className={styles.compactList}>
          {newLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.compactItemSkeleton} />
              ))
            : newTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={styles.compactItem}
                  onClick={() => handleClick(Number(t.id))}
                >
                  <div className={styles.compactThumb}>
                    <img
                      src={getHighResThumbnail(t.thumbnail)}
                      alt={t.title}
                      className={styles.compactThumbImg}
                    />
                  </div>
                  <div className={styles.compactInfo}>
                    {t.categories[0] && (
                      <span className={styles.compactCategory}>
                        {t.categories[0]}
                      </span>
                    )}
                    <p className={styles.compactTitle}>{t.title}</p>
                    <span className={styles.compactUsage}>{t.usage}</span>
                  </div>
                </button>
              ))}
        </div>
      </section>

      <section
        className={styles.section}
        style={{ "--delay": "0.24s" } as React.CSSProperties}
      >
        <h2 className={styles.sectionTitle}>Most popular</h2>
        <div className={styles.denseGrid}>
          {allPopular.map((t) => (
            <Template.Item
              key={t.id}
              templateData={t as unknown as ITemplate}
              onClick={() => handleClick(Number(t.id))}
            />
          ))}
          {(popularLoading || isFetchingNextPage) &&
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonItem key={`sk-${i}`} />
            ))}
        </div>
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

export default WorkContent;
