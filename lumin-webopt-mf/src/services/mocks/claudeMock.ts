import type { ContextQuestionsResponse } from "@/interfaces/contextQuestion.interface";
import type { AiSuggestionsResponse } from "@/services/claude.service";

import mockData from "./claude-mock-data.json";

export const isClaudeDisabled = process.env.LUMIN_DISABLE_CLAUDE === "true";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickManyUnique<T>(arr: T[], count: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export function getMockPrompts(count = 3): string[] {
  if (!mockData.prompts.length) return [];
  return pickManyUnique(mockData.prompts, count);
}

export function getMockInlineCompletion(): string {
  if (!mockData.inlineCompletions.length) return "";
  return pickRandom(mockData.inlineCompletions);
}

export function getMockAiSuggestions(): AiSuggestionsResponse {
  if (!mockData.suggestions.length) return { suggestions: [] };
  return { suggestions: pickManyUnique(mockData.suggestions, 3) };
}

export function getMockContextQuestions(): ContextQuestionsResponse {
  if (!mockData.contextQuestions.length) return { questions: [] };
  return { questions: pickManyUnique(mockData.contextQuestions, 2) };
}
