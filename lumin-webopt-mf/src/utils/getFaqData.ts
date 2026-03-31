import type { ITemplate } from "@/interfaces/template.interface";

export const getFaqData = (template: ITemplate) => {
  const { title, faqSummary, faqWhoNeedsToFill, faqWhereToSubmit } = template;
  const trimedTitle = title.trim();

  return [
    {
      question: `What is ${trimedTitle}?`,
      answer: faqSummary,
    },
    {
      question: `Who needs to fill in ${trimedTitle}?`,
      answer: faqWhoNeedsToFill,
    },
    {
      question: `Where do I submit my ${trimedTitle}?`,
      answer: faqWhereToSubmit,
    },
  ];
};
