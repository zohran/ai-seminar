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

// GET /api/questions/[id] - Get a specific question
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

// PUT /api/questions/[id] - Update a specific question
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

// DELETE /api/questions/[id] - Delete a specific question
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
