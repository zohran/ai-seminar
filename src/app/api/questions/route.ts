import { NextRequest, NextResponse } from "next/server";
import { readQuestions, addQuestion } from "@/lib/storage";
import { CreateQuestionDto } from "@/types/question";

// Polyfill for environments where URL.canParse is unavailable (e.g., older Node versions)
type URLWithOptionalCanParse = typeof URL & {
  canParse?: (input: string, base?: string) => boolean;
};
const URLPolyfill = URL as unknown as URLWithOptionalCanParse;
if (!URLPolyfill.canParse) {
  URLPolyfill.canParse = (input: string, base?: string) => {
    try {
      void new URL(input, base);
      return true;
    } catch {
      return false;
    }
  };
}

/**
 * Validates a CreateQuestionDto for required fields and allowed urgency values.
 *
 * Returns an error message if validation fails, or `null` when the input is valid.
 *
 * Required fields: `title`, `question`, `urgency`.
 * Allowed urgencies: `"low"`, `"medium"`, `"high"`.
 *
 * @param body - The question payload to validate
 * @returns A human-readable validation error string, or `null` if `body` is valid
 */
function validateQuestionData(body: CreateQuestionDto): string | null {
  const missingFields = [];
  if (!body.title) missingFields.push("title");
  if (!body.question) missingFields.push("question");
  if (!body.urgency) missingFields.push("urgency");

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  const validUrgencies = ["low", "medium", "high"];
  if (!validUrgencies.includes(body.urgency)) {
    return "Urgency must be low, medium, or high";
  }

  return null;
}

/**
 * Retrieve all stored questions and return them as a JSON response.
 *
 * On success returns a NextResponse with body `{ success: true, data: questions }`.
 * On failure returns a 500 response with `{ success: false, error: "Failed to retrieve questions" }`.
 *
 * @returns A NextResponse containing the JSON payload described above.
 */
export async function GET() {
  try {
    const questions = await readQuestions();
    return NextResponse.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error("Error reading questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve questions"
      },
      { status: 500 }
    );
  }
}

/**
 * Create a new question from a JSON request body.
 *
 * Expects the request body to match CreateQuestionDto. Validates required fields
 * (title, question, urgency) and allowed urgencies ("low" | "medium" | "high").
 * On success creates the question via addQuestion and returns the created record.
 *
 * @param request - NextRequest whose JSON body conforms to CreateQuestionDto
 * @returns A NextResponse JSON object:
 *  - 201 with { success: true, data } on success
 *  - 400 with { success: false, error } when validation fails
 *  - 500 with { success: false, error } on internal error
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateQuestionDto = await request.json();

    // Validate question data
    const validationError = validateQuestionData(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError
        },
        { status: 400 }
      );
    }

    const newQuestion = await addQuestion({
      title: body.title.trim(),
      question: body.question.trim(),
      urgency: body.urgency
    });

    return NextResponse.json(
      {
        success: true,
        data: newQuestion
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create question"
      },
      { status: 500 }
    );
  }
}
