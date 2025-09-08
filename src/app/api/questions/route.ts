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

// Helper function to validate question data
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

// GET /api/questions - Retrieve all questions
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

// POST /api/questions - Create a new question
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
