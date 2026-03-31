import { useCallback, useEffect, useRef, useState } from "react";

import { SkeletonItem } from "@/components/Skeleton";
import { Template } from "@/components/Template";

import { useMostPopularInLumin } from "@/hooks/useTemplates";
import type { TemplatePageData } from "@/interfaces/api.interface";
import type { ITemplate } from "@/interfaces/template.interface";

import styles from "./MostPopularTemplates.module.scss";

const MostPopularTemplates = () => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMostPopularInLumin();
  const observerRef = useRef<HTMLDivElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );

  const allTemplates =
    data?.pages.flatMap((page: TemplatePageData) => page.templates) || [];

  const handleTemplateClick = (template: ITemplate) => {
    setSelectedTemplateId(Number(template.id));
  };

  const handleCloseModal = () => {
    setSelectedTemplateId(null);
  };

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
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (error) {
    return (
      <section className={styles.container}>
        <h2 className={styles.title}>Most templates from Lumin</h2>
        <div className={styles.list}>
          <div>
            Error:{" "}
            {error instanceof Error
              ? error.message
              : "Failed to load templates"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Most templates from Lumin</h2>
      <div className={styles.list}>
        {allTemplates.map((template) => (
          <Template.Item
            key={template.id}
            templateData={template as unknown as ITemplate}
            onClick={() =>
              handleTemplateClick(template as unknown as ITemplate)
            }
          />
        ))}
        {(isLoading || isFetchingNextPage) &&
          Array.from({ length: 12 }).map((_, index) => (
            <SkeletonItem key={`skeleton-${index}`} />
          ))}
      </div>
      <div ref={observerRef} className={styles.loadTrigger} />

      <Template.DetailModal
        isOpen={!!selectedTemplateId}
        templateId={selectedTemplateId ?? 0}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default MostPopularTemplates;
