import { useState } from "react";

import { SkeletonCard } from "@/components/Skeleton";
import { Template } from "@/components/Template";

import { useNewInLumin } from '@/hooks/useTemplates';
import type { ITemplate } from '@/interfaces/template.interface';

import styles from "./NewInLumin.module.scss";

const TEMPLATE_LIMIT = 5;

const NewInLumin = () => {
  const { data, isLoading, error } = useNewInLumin(TEMPLATE_LIMIT);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );

  const templates = data?.templates || [];

  const handleTemplateClick = (template: any) => {
    setSelectedTemplateId(Number(template.id));
  };

  const handleCloseModal = () => {
    setSelectedTemplateId(null);
  };

  if (error) {
    return (
      <section className={styles.container}>
        <h2 className={styles.title}>New in Lumin</h2>
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

  if (isLoading) {
    return (
      <section className={styles.container}>
        <h2 className={styles.title}>New in Lumin</h2>
        <div className={styles.list}>
          {Array.from({ length: TEMPLATE_LIMIT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>New in Lumin</h2>
      <div className={styles.list}>
        {templates.map((template) => (
          <Template.Card
            key={template.id}
            template={template as unknown as ITemplate}
            onClick={() => handleTemplateClick(template)}
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

export default NewInLumin;
