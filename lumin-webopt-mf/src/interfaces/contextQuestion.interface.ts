export interface ContextQuestionOption {
  label: string;
  value: string;
}

export interface ContextQuestion {
  id: string;
  question: string;
  options: ContextQuestionOption[];
}

export interface ContextQuestionsResponse {
  questions: ContextQuestion[];
}
