export interface Question {
  id: string;
  title: string;
  question: string;
  urgency: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionDto {
  title: string;
  question: string;
  urgency: "low" | "medium" | "high";
}

export interface UpdateQuestionDto {
  title?: string;
  question?: string;
  urgency?: "low" | "medium" | "high";
}

export interface QuestionResponse {
  success: boolean;
  data?: Question | Question[];
  error?: string;
}

export type UrgencyLevel = "low" | "medium" | "high";

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority"
};

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  low: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
  medium:
    "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20",
  high: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
};
