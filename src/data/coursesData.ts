import { ExamBlock } from "@/types/exam";

export interface Exam {
  id: string;
  title: string;
  year: string;
  semester: string;
  blocks: ExamBlock[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  exams: Exam[];
}

// Sample exam data
const sampleExamBlocks: ExamBlock[] = [
  {
    id: "block-1",
    title: "Block 1: Data Structures Fundamentals",
    backgroundInfo:
      "Data structures are fundamental building blocks in computer science. Understanding how different data structures work, their time complexities, and appropriate use cases is crucial for efficient algorithm design.",
    canBeNegative: false,
    questions: [
      {
        id: "q1-1",
        text: "Which of the following data structures follow the LIFO (Last In First Out) principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswers: [1],
        multipleCorrect: false,
      },
      {
        id: "q1-2",
        text: "What is the time complexity of accessing an element by index in an array?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswers: [0],
        multipleCorrect: false,
      },
      {
        id: "q1-3",
        text: "Which operations are typically supported by a queue? (Select all that apply)",
        options: ["Enqueue", "Dequeue", "Push", "Pop"],
        correctAnswers: [0, 1],
        multipleCorrect: true,
      },
      {
        id: "q1-4",
        text: "In a singly linked list, each node contains:",
        options: [
          "Only data",
          "Data and a pointer to the next node",
          "Data and pointers to both next and previous nodes",
          "Only a pointer",
        ],
        correctAnswers: [1],
        multipleCorrect: false,
      },
      {
        id: "q1-5",
        text: "Which data structures can be used to implement a stack? (Select all that apply)",
        options: ["Array", "Linked List", "Queue", "Hash Table"],
        correctAnswers: [0, 1],
        multipleCorrect: true,
      },
    ],
  },
  {
    id: "block-2",
    title: "Block 2: Algorithm Analysis",
    backgroundInfo:
      "Algorithm analysis helps us understand the efficiency of algorithms in terms of time and space complexity. Big O notation provides a way to classify algorithms according to how their running time or space requirements grow as the input size grows.",
    canBeNegative: false,
    questions: [
      {
        id: "q2-1",
        text: "What does O(n) time complexity represent?",
        options: [
          "Constant time",
          "Linear time",
          "Logarithmic time",
          "Quadratic time",
        ],
        correctAnswers: [1],
        multipleCorrect: false,
      },
      {
        id: "q2-2",
        text: "Which sorting algorithms have O(n log n) average time complexity? (Select all that apply)",
        options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Selection Sort"],
        correctAnswers: [1, 2],
        multipleCorrect: true,
      },
      {
        id: "q2-3",
        text: "Binary search has a time complexity of:",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswers: [1],
        multipleCorrect: false,
      },
      {
        id: "q2-4",
        text: "Which of these factors affect algorithm efficiency? (Select all that apply)",
        options: [
          "Input size",
          "Hardware specifications",
          "Programming language",
          "Algorithm design",
        ],
        correctAnswers: [0, 3],
        multipleCorrect: true,
      },
      {
        id: "q2-5",
        text: "What is space complexity?",
        options: [
          "The physical space an algorithm occupies on disk",
          "The amount of memory an algorithm uses relative to input size",
          "The time an algorithm takes to execute",
          "The number of lines of code",
        ],
        correctAnswers: [1],
        multipleCorrect: false,
      },
    ],
  },
  {
    id: "block-3",
    title: "Block 3: Python Programming",
    backgroundInfo:
      "Python is a versatile, high-level programming language known for its readability and extensive libraries. Understanding Python's syntax, data types, control structures, and object-oriented features is essential for modern software development.",
    canBeNegative: true,
    questions: [
      {
        id: "q3-1",
        text: "What will be the output of this Python code?\n\nfor i in range(3):\n    print(i, end=' ')",
        options: ["1 2 3", "0 1 2", "0 1 2 3", "1 2"],
        correctAnswers: [1],
        multipleCorrect: false,
      },
      {
        id: "q3-2",
        text: "Which of the following are mutable data types in Python? (Select all that apply)",
        options: ["List", "Tuple", "Dictionary", "String"],
        correctAnswers: [0, 2],
        multipleCorrect: true,
      },
      {
        id: "q3-3",
        text: "What is the correct way to create a dictionary in Python?",
        options: [
          "dict = []",
          "dict = {}",
          "dict = ()",
          "dict = dict[]",
        ],
        correctAnswers: [1],
        multipleCorrect: false,
      },
      {
        id: "q3-4",
        text: "What will 'hello'[1:4] return in Python?",
        options: ["hel", "ell", "ello", "hell"],
        correctAnswers: [1],
        multipleCorrect: false,
      },
      {
        id: "q3-5",
        text: "Which statements about Python list comprehensions are true? (Select all that apply)",
        options: [
          "They provide a concise way to create lists",
          "They are always faster than regular for loops",
          "They can include conditional logic",
          "They cannot be nested",
        ],
        correctAnswers: [0, 2],
        multipleCorrect: true,
      },
    ],
  },
];

export const courses: Course[] = [
  {
    id: "tdt4172",
    code: "TDT4172",
    name: "Introduction to Machine Learning",
    exams: [
      {
        id: "tdt4172-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
      {
        id: "tdt4172-2023-fall",
        title: "Fall 2023",
        year: "2023",
        semester: "Fall",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-1",
    code: "PLACEHOLDER1",
    name: "Placeholder Course 1",
    exams: [
      {
        id: "placeholder-1-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-2",
    code: "PLACEHOLDER2",
    name: "Placeholder Course 2",
    exams: [
      {
        id: "placeholder-2-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-3",
    code: "PLACEHOLDER3",
    name: "Placeholder Course 3",
    exams: [
      {
        id: "placeholder-3-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-4",
    code: "PLACEHOLDER4",
    name: "Placeholder Course 4",
    exams: [
      {
        id: "placeholder-4-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-5",
    code: "PLACEHOLDER5",
    name: "Placeholder Course 5",
    exams: [
      {
        id: "placeholder-5-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-6",
    code: "PLACEHOLDER6",
    name: "Placeholder Course 6",
    exams: [
      {
        id: "placeholder-6-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-7",
    code: "PLACEHOLDER7",
    name: "Placeholder Course 7",
    exams: [
      {
        id: "placeholder-7-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-8",
    code: "PLACEHOLDER8",
    name: "Placeholder Course 8",
    exams: [
      {
        id: "placeholder-8-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-9",
    code: "PLACEHOLDER9",
    name: "Placeholder Course 9",
    exams: [
      {
        id: "placeholder-9-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
  {
    id: "placeholder-10",
    code: "PLACEHOLDER10",
    name: "Placeholder Course 10",
    exams: [
      {
        id: "placeholder-10-2024-spring",
        title: "Spring 2024",
        year: "2024",
        semester: "Spring",
        blocks: sampleExamBlocks,
      },
    ],
  },
];
