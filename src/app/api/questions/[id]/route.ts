import { NextRequest, NextResponse } from "next/server";
import { getQuestionById, updateQuestion, deleteQuestion } from "@/lib/storage";

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
 * HTTP GET handler that returns a question by its id.
 *
 * Looks up the question id from `context.params`, returns a 200 JSON response
 * with `{ success: true, data }` when found, a 404 JSON error when the question
 * does not exist, or a 500 JSON error on server failure.
 *
 * @param context - Route context whose `params` resolves to an object containing `id`.
 * @returns A NextResponse with a JSON body:
 *   - 200: `{ success: true, data: question }`
 *   - 404: `{ success: false, error: "Question not found" }`
 *   - 500: `{ success: false, error: "Failed to retrieve question" }`
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const question = await getQuestionById(id);

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: "Question not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error("Error retrieving question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve question"
      },
      { status: 500 }
    );
  }
}

/**
 * Updates a question by ID using fields from the request JSON body.
 *
 * Accepts a JSON payload with any of the fields:
 * - `title` (string, trimmed) — new title
 * - `question` (string, trimmed) — new question text
 * - `urgency` (string) — must be one of `"low"`, `"medium"`, or `"high"` if provided
 *
 * Returns:
 * - 200 with `{ success: true, data: updatedQuestion }` on success
 * - 400 with `{ success: false, error: "Urgency must be low, medium, or high" }` when `urgency` is invalid
 * - 404 with `{ success: false, error: "Question not found" }` if no question exists for the given id
 * - 500 with `{ success: false, error: "Failed to update question" }` on server errors
 *
 * The function trims `title` and `question` values before updating. The `id` is read from route params.
 *
 * @returns A NextResponse containing a JSON object with `success` and either `data`, `message`, or `error`.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    // Validate urgency if provided
    if (body.urgency && !["low", "medium", "high"].includes(body.urgency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Urgency must be low, medium, or high"
        },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const updatedQuestion = await updateQuestion(id, {
      title: body.title?.trim(),
      question: body.question?.trim(),
      urgency: body.urgency
    });

    if (!updatedQuestion) {
      return NextResponse.json(
        {
          success: false,
          error: "Question not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update question"
      },
      { status: 500 }
    );
  }
}

/**
 * Deletes a question by ID.
 *
 * Attempts to remove the question identified by `context.params.id`. Returns a 200 JSON response on successful deletion, a 404 JSON response if the question doesn't exist, or a 500 JSON response on server error.
 *
 * @param context - contains a Promise `params` that resolves to an object with the `id` of the question to delete
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteQuestion(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Question not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete question"
      },
      { status: 500 }
    );
  }
}
