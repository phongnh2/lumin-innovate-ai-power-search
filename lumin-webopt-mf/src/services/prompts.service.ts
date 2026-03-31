import { apiClient } from "./api";
import { isClaudeDisabled, getMockPrompts } from "./mocks/claudeMock";

export interface PromptsApiResponse {
  prompt: string[];
}

export interface PromptsData {
  prompts: string[];
}

const DEFAULT_PROMPT_CONTEXT =
  "Generate natural search prompts for finding document templates, forms, and legal or business paperwork";

export interface FollowUpApiResponse {
  original_prompt: string;
  follow_up_queries: string[];
}

export interface SearchHit {
  id: number;
  title: string;
  internalNotes: string;
  totalUsed: number;
}

export interface SearchApiResponse {
  query: string;
  hits: SearchHit[];
  total_hits: number;
  processing_time_ms: number;
  hybrid_enabled: boolean;
}

export const loadPrompts = async (context?: string): Promise<PromptsData> => {
  if (isClaudeDisabled) {
    return { prompts: getMockPrompts() };
  }

  const { data } = await apiClient.post<PromptsApiResponse>("/api/v2/prompts", {
    context:
      context || process.env.LUMIN_PROMPT_CONTEXT || DEFAULT_PROMPT_CONTEXT,
  });
  return { prompts: data.prompt.map((p) => p.trim()) };
};

export const loadFollowUp = async (
  prompt: string,
): Promise<FollowUpApiResponse> => {
  const { data } = await apiClient.post<FollowUpApiResponse>(
    "/api/v1/prompts/follow-up",
    { prompt },
  );
  return data;
};

export const searchTemplates = async (
  query: string,
): Promise<SearchApiResponse> => {
  const { data } = await apiClient.post<SearchApiResponse>("/api/v1/search", {
    query,
    use_hybrid: true,
    limit: 5,
  });
  return data;
};
