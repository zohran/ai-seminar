import * as XLSX from "xlsx";
import { Question } from "@/types/question";
import { promises as fs } from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const QUESTIONS_FILE = path.join(STORAGE_DIR, "questions.xlsx");

/**
 * Ensure the storage directory exists, creating it recursively if missing.
 *
 * This function is idempotent: if the directory already exists it returns successfully.
 *
 * @throws If the underlying filesystem calls fail (e.g., insufficient permissions or I/O errors).
 */
export async function ensureStorageDir(): Promise<void> {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Reads all Question records from the persisted Excel workbook and returns them as Question objects.
 *
 * Ensures the storage directory exists, attempts to read the configured Excel file (first worksheet),
 * and converts each row into a Question. The `createdAt` and `updatedAt` fields are parsed into Date objects.
 * If the file is missing or an error occurs while reading/parsing, an empty array is returned.
 *
 * @returns An array of Questions read from the Excel file; empty if no file or on read/parse errors.
 */
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
      urgency: Question["urgency"];
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

/**
 * Persists an array of Question records to the XLSX file at storage/questions.xlsx.
 *
 * Ensures the storage directory exists, serializes each question (converting `createdAt`
 * and `updatedAt` to ISO strings), writes them into a worksheet named "Questions",
 * and writes the workbook to disk.
 *
 * @param questions - Array of Question objects to write; `createdAt` and `updatedAt` must be valid Date instances.
 */
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

/**
 * Creates and persists a new Question.
 *
 * Generates a new `id`, sets `createdAt` and `updatedAt` to the current time, appends the entry to storage, and writes the updated list to the Excel file.
 *
 * @param questionData - Question fields excluding `id`, `createdAt`, and `updatedAt`.
 * @returns The newly created Question including `id`, `createdAt`, and `updatedAt`.
 */
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

/**
 * Update fields of an existing Question and persist the change to storage.
 *
 * Applies the provided partial `updates` to the question with the given `id`, sets `updatedAt` to the current time, writes the updated collection back to the Excel store, and returns the updated Question.
 *
 * @param id - The identifier of the question to update.
 * @param updates - Partial fields to merge into the existing question (cannot update `id` or `createdAt`).
 * @returns The updated Question if found and saved; otherwise `null` when no question with `id` exists.
 */
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

/**
 * Remove a question by its id from the Excel-backed storage.
 *
 * Attempts to delete the question with the given `id`. If a matching question is found the storage
 * is persisted with that question removed and the function resolves to `true`. If no matching
 * question exists, the storage is left unchanged and the function resolves to `false`.
 *
 * @param id - The unique identifier of the question to delete.
 * @returns `true` if a question was deleted; `false` if no question with the given `id` was found.
 */
export async function deleteQuestion(id: string): Promise<boolean> {
  const questions = await readQuestions();
  const filteredQuestions = questions.filter((q) => q.id !== id);

  if (filteredQuestions.length === questions.length) {
    return false; // Question not found
  }

  await writeQuestions(filteredQuestions);
  return true;
}

/**
 * Retrieve a question by its ID from the Excel-backed storage.
 *
 * @param id - The unique identifier of the question to find.
 * @returns The matching Question, or `null` if no question with the given ID exists.
 */
export async function getQuestionById(id: string): Promise<Question | null> {
  const questions = await readQuestions();
  return questions.find((q) => q.id === id) || null;
}
