import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  text: z.string().min(1, "Question text is required"),
  options: z.array(z.string().min(1, "Option text cannot be empty")).min(2, "At least 2 options required"),
  correctAnswers: z.array(z.number().int().nonnegative()),
  multipleCorrect: z.boolean(),
}).refine(
  (data) => data.correctAnswers.length > 0,
  { message: "At least one correct answer is required" }
).refine(
  (data) => data.correctAnswers.every((idx) => idx < data.options.length),
  { message: "Correct answer indices must be within options array bounds" }
).refine(
  (data) => {
    if (data.multipleCorrect) {
      return data.correctAnswers.length > 1;
    } else {
      return data.correctAnswers.length === 1;
    }
  },
  { message: "multipleCorrect must match the number of correct answers (true if >1, false if ==1)" }
);

export const blockSchema = z.object({
  id: z.string().min(1, "Block ID is required"),
  title: z.string().min(1, "Block title is required"),
  backgroundInfo: z.string().default(""),
  canBeNegative: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, "At least 1 question required per block"),
});

export const examJsonSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  examTitle: z.string().min(1, "Exam title is required"),
  examYear: z.string().min(4, "Year must be 4 digits").max(4),
  examSemester: z.string().min(1, "Semester is required"),
  isPublic: z.boolean().default(true),
  blocks: z.array(blockSchema).min(1, "At least 1 block required"),
}).refine(
  (data) => {
    const blockIds = data.blocks.map((b) => b.id);
    return new Set(blockIds).size === blockIds.length;
  },
  { message: "Block IDs must be unique" }
).refine(
  (data) => {
    for (const block of data.blocks) {
      const questionIds = block.questions.map((q) => q.id);
      if (new Set(questionIds).size !== questionIds.length) {
        return false;
      }
    }
    return true;
  },
  { message: "Question IDs must be unique within each block" }
);

export type ExamJson = z.infer<typeof examJsonSchema>;

export function validateExamJson(json: any): { success: true; data: ExamJson } | { success: false; errors: string[] } {
  const result = examJsonSchema.safeParse(json);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map((err) => {
      const path = err.path.join(".");
      return `${path ? path + ": " : ""}${err.message}`;
    });
    return { success: false, errors };
  }
}
