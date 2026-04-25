import { useState } from "react";

import { SkeletonItem } from "@/components/Skeleton";
import { Template } from "@/components/Template";

import { useFeaturedLegalContent } from "@/hooks/useFeaturedLegalContent";
import type { ITemplate } from "@/interfaces/template.interface";

import styles from "./FeaturedLegalContent.module.scss";

const TEMPLATE_LIMIT = 6;

const FeaturedLegalContent = () => {
  const { data, isLoading, error } = useFeaturedLegalContent(TEMPLATE_LIMIT);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );

  const templates = data?.templates || [];

  const handleTemplateClick = (templateId: number) => {
    setSelectedTemplateId(templateId);
  };

  const handleCloseModal = () => {
    setSelectedTemplateId(null);
  };

  if (error) {
    return (
      <section className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Featured Legal Content Packs</h2>
          <p className={styles.subtitle}>
            Professional templates crafted by Parry Field Lawyers and Maguire
            Legal
          </p>
        </div>
        <div className={styles.list}>
          <div>
            Error:{" "}
            {error instanceof Error
              ? error.message
              : "Failed to load legal content"}
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Featured Legal Content Packs</h2>
          <p className={styles.subtitle}>
            Professional templates crafted by Parry Field Lawyers and Maguire
            Legal
          </p>
        </div>
        <div className={styles.list}>
          {Array.from({ length: TEMPLATE_LIMIT }).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Featured Legal Content Packs</h2>
        </div>
        <p className={styles.subtitle}>
          Exclusive legal templates trusted by professionals – powered by Parry
          Field Lawyers and Maguire Legal
        </p>
      </div>
      <div className={styles.list}>
        {templates.map((template: ITemplate, index: number) => (
          <Template.Item
            key={template.id + index}
            templateData={template}
            onClick={() => handleTemplateClick(Number(template.id))}
          />
        ))}
      </div>
      <Template.DetailModal
        isOpen={!!selectedTemplateId}
        templateId={selectedTemplateId ?? 0}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default FeaturedLegalContent;
