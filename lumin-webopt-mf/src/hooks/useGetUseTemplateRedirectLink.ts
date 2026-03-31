import { useEffect, useState } from "react";

import { getLinkToLuminPDF } from "@/utils/getLinkRedirectTemplate";

const useGetUseTemplateRedirectLink = ({
  id,
  slug,
}: {
  id: number;
  slug: string;
}) => {
  const [fallbackURL, setFallbackURL] = useState("");

  useEffect(() => {
    const getFallbackURL = () => {
      const url = getLinkToLuminPDF({ id, slug });

      return url;
    };

    setFallbackURL(getFallbackURL());
  }, [id, slug]);

  return fallbackURL;
};
export { useGetUseTemplateRedirectLink };
