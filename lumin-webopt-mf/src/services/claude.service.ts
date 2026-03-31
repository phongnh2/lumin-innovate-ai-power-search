import axios from "axios";

import type { ContextQuestionsResponse } from "@/interfaces/contextQuestion.interface";
import {
  isClaudeDisabled,
  getMockInlineCompletion,
  getMockContextQuestions,
  getMockAiSuggestions,
} from "./mocks/claudeMock";

export interface AiSuggestion {
  original: string;
  corrected: string;
  confidence: number;
}

export interface AiSuggestionsResponse {
  suggestions: AiSuggestion[];
}

interface ClaudeMessageResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

const claudeClient = axios.create({
  baseURL: "https://api.anthropic.com",
  headers: {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  },
});

claudeClient.interceptors.request.use((config) => {
  const apiKey = process.env.LUMIN_CLAUDE_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("LUMIN_CLAUDE_API_KEY is not configured"));
  }
  config.headers["x-api-key"] = apiKey;
  return config;
});

const SUGGESTION_SYSTEM_PROMPT = `You are a form/document name autocomplete assistant for a legal template library.

Given user input text, identify any form names, document types, or legal template references that appear to be:
1. Misspelled or have typos (e.g., "form 4w" → "Form W-4")
2. Incomplete abbreviations (e.g., "w2" → "Form W-2")
3. Near-matches to popular US government/legal forms (e.g., "1099" → "Form 1099-MISC", "Form 1099-NEC")
4. Common document types that could be more specific (e.g., "lease" → "Residential Lease Agreement", "Commercial Lease Agreement")

Rules:
- Return 1-5 suggestions maximum, ranked by relevance/likelihood.
- Only suggest corrections for the form/document name portions, not the entire user input.
- If the input is already correct or no corrections are needed, return an empty array.
- If the input is too vague or unrelated to forms/documents, return an empty array.
- Focus on: IRS forms, government forms, legal agreements, business documents, HR forms.

You MUST respond with valid JSON only, no markdown, no explanation. Use this exact schema:
{
  "suggestions": [
    { "original": "<matched portion>", "corrected": "<corrected name>", "confidence": <0-1> }
  ]
}`;

const COMPLETION_SYSTEM_PROMPT = `You are a search autocomplete assistant for a legal template library.

Given a user's partial search input, predict the most likely completion of their sentence.

Rules:
- Return ONLY the completion text (the part that comes AFTER what the user already typed).
- Do NOT repeat any part of the user's input.
- Keep completions concise (under 10 words).
- Focus on legal documents, forms, agreements, contracts, government forms, and business templates.
- If the input is too short or vague to complete meaningfully, return an empty string.
- Return plain text only, no quotes, no JSON, no explanation.

Examples:
- User typed: "find a non disclosure" → " agreement template"
- User typed: "form w" → "-4 tax withholding form"
- User typed: "rental agreement for" → " residential property"`;

export const getInlineCompletion = async (
  userInput: string,
): Promise<string> => {
  if (isClaudeDisabled) return getMockInlineCompletion();

  const { data } = await claudeClient.post<ClaudeMessageResponse>(
    "/v1/messages",
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 64,
      system: COMPLETION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `User typed: "${userInput}"`,
        },
      ],
    },
  );

  const result = (data.content[0]?.text || "").trimEnd();

  // Filter out non-completion responses (e.g. explanations like
  // "The user's input is already complete..."). Valid completions
  // are short fragments, not full sentences.
  const MAX_COMPLETION_WORDS = 10;
  const wordCount = result.trim().split(/\s+/).length;
  if (!result.trim() || wordCount > MAX_COMPLETION_WORDS) {
    return "";
  }

  return result;
};

const CONTEXT_QUESTIONS_SYSTEM_PROMPT = `You are a legal template search assistant. Given a user's search query for legal documents/forms/templates, determine if the query would benefit from additional context to narrow down results.

Generate 1-3 follow-up multiple-choice questions that would make the search more specific and relevant. Focus on:
1. Jurisdiction (country, state/province) - if the legal context varies by jurisdiction
2. Party type (employee/contractor, individual/business, landlord/tenant, etc.)
3. Use case (personal/commercial, one-time/recurring, etc.)

Rules:
- Return 0 questions if the query is already very specific or context would not help
- Each question must have 3-6 concise options
- Keep questions short and clear
- Return valid JSON only, no markdown, no explanation

Schema:
{
  "questions": [
    {
      "id": "<snake_case_identifier>",
      "question": "<question text>",
      "options": [
        { "label": "<display text>", "value": "<search context to append>" }
      ]
    }
  ]
}

Examples:
- Query "non-disclosure agreement" → questions about jurisdiction, party relationship
- Query "IRS Form W-4" → no questions needed (already specific)
- Query "lease agreement" → questions about jurisdiction, residential/commercial`;

export const getContextQuestions = async (
  userQuery: string,
): Promise<ContextQuestionsResponse> => {
  if (isClaudeDisabled) return getMockContextQuestions();

  const { data } = await claudeClient.post<ClaudeMessageResponse>(
    "/v1/messages",
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: CONTEXT_QUESTIONS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `User search query: "${userQuery}"`,
        },
      ],
    },
  );

  const rawText = data.content[0]?.text || '{"questions":[]}';
  const text = rawText.replace(/^```(?:json)?\s*\n?|\n?```\s*$/g, "").trim();

  try {
    return JSON.parse(text) as ContextQuestionsResponse;
  } catch {
    console.warn("[Context Questions] Failed to parse Claude response:", rawText);
    return { questions: [] };
  }
};

export const getAiSuggestions = async (
  userInput: string,
): Promise<AiSuggestionsResponse> => {
  if (isClaudeDisabled) return getMockAiSuggestions();

  const { data } = await claudeClient.post<ClaudeMessageResponse>(
    "/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: SUGGESTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `User typed: "${userInput}"`,
        },
      ],
    },
  );

  const text = data.content[0]?.text || '{"suggestions":[]}';

  try {
    return JSON.parse(text) as AiSuggestionsResponse;
  } catch {
    console.warn("[AI Suggestions] Failed to parse Claude response:", text);
    return { suggestions: [] };
  }
};
