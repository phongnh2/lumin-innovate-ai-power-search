import { useQuery } from "@/libs/react-query";

import { loadPrompts } from "@/services/prompts.service";

export const usePrompts = () =>
  useQuery({
    queryKey: ["prompts"],
    queryFn: loadPrompts,
  });
