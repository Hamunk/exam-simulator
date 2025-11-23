export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[]; // indices of correct options
  multipleCorrect: boolean;
}

export interface ExamBlock {
  id: string;
  title: string;
  backgroundInfo: string;
  questions: Question[];
  canBeNegative: boolean;
}

export interface UserAnswer {
  questionId: string;
  selectedOptions: number[];
}

export interface BlockScore {
  blockId: string;
  score: number;
  maxScore: number;
}
