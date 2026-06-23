import type { Types } from "mongoose";

import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources";

import type { ApplicationStatus, TaskStatus } from "@jobflow/shared";
import {
  Application as ApplicationModel,
  Task as TaskModel,
} from "../models/index.ts";
import { AppError } from "../utils/index.ts";

import { generatedTaskSchema, returnedErrorSchema, type GeneratedTask } from "./ai.schemas.ts";
import { aiTools } from "./ai.tools.ts";
import { FOLLOW_UP_SUGGESTION_PROMPT } from "./ai.prompt.ts";

type ApplicationContextArgs = {
  appId: string;
  userId: string;
};

type LeanTask = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: number;
};

type TaskContext = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: number;
};

type ApplicationContextResult = {
  application: {
    id: string;
    name: string;
    status: ApplicationStatus;
    appliedAt?: Date;
    deadline?: Date;
    followUpAt?: Date;
    notes?: string;
  };
  tasks: TaskContext[];
};

export const getApplicationContext = async ({
  appId,
  userId,
}: ApplicationContextArgs): Promise<ApplicationContextResult> => {
  const app = await ApplicationModel.findOne({
    _id: appId,
    user: userId,
  }).lean();

  if (!app) {
    throw new AppError(
      404,
      `Application: ${appId} not found`,
      "NO_APP",
      "WARN",
    );
  }

  const tasks = await TaskModel.find({
    application: appId,
    user: userId,
  })
    .select("_id title description status priority")
    .sort({ priority: -1 })
    .lean<LeanTask[]>();

  return {
    application: {
      id: app._id.toString(),
      name: app.name,
      status: app.status,
      appliedAt: app.appliedAt,
      deadline: app.deadline,
      followUpAt: app.followUpAt,
      notes: app.notes,
    },
    tasks: tasks.map(
      (task: LeanTask): TaskContext => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
      }),
    ),
  };
};

export const parseGeneratedSuggestion = (args: unknown): GeneratedTask => {
  return generatedTaskSchema.parse(args);
};

export const createSuggestedTask = async ({
  suggestion,
  userId,
  appId,
}: {
  suggestion: GeneratedTask;
  userId: string;
  appId: string;
}) => {
  return TaskModel.create({
    ...suggestion,
    user: userId,
    application: appId,
    status: "TODO",
  });
};

type ToolExecutionResult =
  | {
      finished: false;
      result: ApplicationContextResult;
    }
  | {
      finished: true;
      result: Awaited<ReturnType<typeof createSuggestedTask>>;
    };

const executeToolCall = async ({
  toolCall,
  userId,
  appId,
}: {
  toolCall: ChatCompletionMessageToolCall;
  userId: string;
  appId: string;
}): Promise<ToolExecutionResult> => {
  if (toolCall.type !== "function") {
    throw new AppError(
      400,
      `Unsupported AI tool type: ${toolCall.type}`,
      "UNSUPPORTED_AI_TOOL",
      "WARN",
    );
  }

  console.log("AI tool call:", toolCall.function.name);

  let args: unknown;

  try {
    args = JSON.parse(toolCall.function.arguments);
  } catch {
    throw new AppError(
      400,
      "The AI returned invalid tool arguments.",
      "INVALID_AI_TOOL_ARGUMENTS",
      "WARN",
    );
  }

  switch (toolCall.function.name) {
    case "get_application_context": {
      const context = await getApplicationContext({
        appId,
        userId,
      });

      return {
        finished: false,
        result: context,
      };
    }

    case "generate_suggestion": {
      const suggestion = parseGeneratedSuggestion(args);

      const task = await createSuggestedTask({
        suggestion,
        userId,
        appId,
      });

      return {
        finished: true,
        result: task,
      };
    }

    case "return_error": {
      const parsed = returnedErrorSchema.parse(args);

      const statusCodeMap = {
        INSUFFICIENT_CONTEXT: 422,
        NO_ACTION_REQUIRED: 422,
        TASK_EXISTS: 409,
      } as const;

      throw new AppError(
        statusCodeMap[parsed.errorCode],
        parsed.message,
        parsed.errorCode,
        "WARN",
      );
    }

    default:
      throw new AppError(
        400,
        `Unknown AI tool: ${toolCall.function.name}`,
        "UNKNOWN_AI_TOOL",
        "WARN",
      );
  }
};

export const runFollowUpSuggestion = async ({
  userId,
  appId,
}: {
  userId: string;
  appId: string;
}) => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const model = process.env.OPENAI_MODEL!;

  if (!model) {
    throw new AppError(
      500,
      "AI model is not configured.",
      "AI_MODEL_MISSING",
      "ERROR",
    );
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: FOLLOW_UP_SUGGESTION_PROMPT,
    },
    {
      role: "user",
      content: `Create a follow-up suggestion for application ${appId}.`,
    },
  ];

  const maxRounds = 3;

  for (let round = 0; round < maxRounds; round += 1) {
    const completion = await client.chat.completions.create({
      model,
      tools: aiTools,
      tool_choice: "required",
      messages,
      temperature: 0,
    });

    const message = completion.choices[0]?.message;

    if (!message) {
      throw new AppError(
        500,
        "Failed to generate a response from the model.",
        "AI_RESPONSE_MISSING",
        "ERROR",
      );
    }

    messages.push(message);

    const toolCalls = message.tool_calls ?? [];

    if (toolCalls.length === 0) {
      throw new AppError(
        500,
        "The AI did not call a required tool.",
        "AI_TOOL_CALL_MISSING",
        "ERROR",
      );
    }

    for (const toolCall of toolCalls) {
      const execution = await executeToolCall({
        toolCall,
        userId,
        appId,
      });

      if (execution.finished) {
        return execution.result;
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(execution.result),
      });
    }
  }

  throw new AppError(
    500,
    "The AI workflow exceeded the maximum number of steps.",
    "AI_MAX_ROUNDS_EXCEEDED",
    "ERROR",
  );
};
