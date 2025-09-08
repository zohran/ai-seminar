import * as XLSX from "xlsx";
import { Question } from "@/types/question";
import { promises as fs } from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const QUESTIONS_FILE = path.join(STORAGE_DIR, "questions.xlsx");

// Ensure storage directory exists
export async function ensureStorageDir(): Promise<void> {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Read questions from Excel file
export async function readQuestions(): Promise<Question[]> {
  await ensureStorageDir();

  try {
    await fs.access(QUESTIONS_FILE);
    const fileBuffer = await fs.readFile(QUESTIONS_FILE);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    type Row = {
      id: string;
      title: string;
      question: string;
      urgency: Question['urgency'];
      createdAt: string | Date;
      updatedAt: string | Date;
      [key: string]: unknown;
    };
    return (jsonData as Row[]).map((row) => ({
      id: row.id,
      title: row.title,
      question: row.question,
      urgency: row.urgency,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  } catch (error) {
    // File doesn't exist, return empty array
    return [];
  }
}

// Write questions to Excel file
export async function writeQuestions(questions: Question[]): Promise<void> {
  await ensureStorageDir();

  const worksheet = XLSX.utils.json_to_sheet(
    questions.map((q) => ({
      id: q.id,
      title: q.title,
      question: q.question,
      urgency: q.urgency,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString()
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  await fs.writeFile(QUESTIONS_FILE, buffer);
}

// Add a new question
export async function addQuestion(
  questionData: Omit<Question, "id" | "createdAt" | "updatedAt">
): Promise<Question> {
  const questions = await readQuestions();
  const newQuestion: Question = {
    id: crypto.randomUUID(),
    ...questionData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  questions.push(newQuestion);
  await writeQuestions(questions);

  return newQuestion;
}

// Update a question
export async function updateQuestion(
  id: string,
  updates: Partial<Omit<Question, "id" | "createdAt">>
): Promise<Question | null> {
  const questions = await readQuestions();
  const index = questions.findIndex((q) => q.id === id);

  if (index === -1) {
    return null;
  }

  questions[index] = {
    ...questions[index],
    ...updates,
    updatedAt: new Date()
  };

  await writeQuestions(questions);
  return questions[index];
}

// Delete a question
export async function deleteQuestion(id: string): Promise<boolean> {
  const questions = await readQuestions();
  const filteredQuestions = questions.filter((q) => q.id !== id);

  if (filteredQuestions.length === questions.length) {
    return false; // Question not found
  }

  await writeQuestions(filteredQuestions);
  return true;
}

// Get question by ID
export async function getQuestionById(id: string): Promise<Question | null> {
  const questions = await readQuestions();
  return questions.find((q) => q.id === id) || null;
}
