import type { ChatCompletionTool } from "openai/resources";

export const aiTools = [
  {
    type: "function",
    function: {
      name: "get_application_context",
      description:
        "Fetch the application and its associated tasks for the authenticated user.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          applicationId: {
            type: "string",
            description: "MongoDB ObjectId of the application",
          },
        },
        required: ["applicationId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_suggestion",
      description:
        "Generate one concrete next-action task based on the application context already retrieved.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A concise title for the next-action task.",
          },
          description: {
            type: "string",
            description:
              "What should be done and why this task is recommended.",
          },
          priority: {
            type: "integer",
            description:
              "Task priority from 1 to 5, where 5 is the highest priority.",
            minimum: 1,
            maximum: 5,
          },
        },
        required: ["title", "description", "priority"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "return_error",
      description:
        "Return a structured business error when no meaningful follow-up task can be suggested.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "A concise user-facing explanation.",
          },
          errorCode: {
            type: "string",
            description:
              "The application-specific reason why no task can be suggested.",
            enum: [
              "APPLICATION_NOT_FOUND",
              "INSUFFICIENT_CONTEXT",
              "NO_ACTION_REQUIRED",
              "TASK_EXISTS",
            ],
          },
        },
        required: ["message", "errorCode"],
        additionalProperties: false,
      },
    },
  },
] satisfies ChatCompletionTool[];
