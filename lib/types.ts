export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "Blitz" | "New";
export type QuestionStatus = "Pending" | "Completed" | "Failed";

export interface Question {
  id: string; // uuid
  title: string;
  difficulty: Difficulty;
  url: string;
  type: QuestionType; // Blitz = spaced repetition review, New = first time challenge
  status: QuestionStatus;
  dateAdded: string; // ISO string
  nextReviewDate: string; // ISO string (for Blitz logic)
}
