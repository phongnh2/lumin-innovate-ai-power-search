import { useState } from "react";

import type { ITemplateTimeSensitiveGrouping } from "@/interfaces/template.interface";

export const useRevisionSelection = (
  documents: ITemplateTimeSensitiveGrouping[],
) => {
  const [currentRevision, setCurrentRevision] = useState(documents[0]);

  const handleRevisionSelect = (id: string) => {
    setCurrentRevision(
      documents.find((doc) => doc.id === id) as ITemplateTimeSensitiveGrouping,
    );
  };

  return { handleRevisionSelect, currentRevision };
};
