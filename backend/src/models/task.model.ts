import { Schema, model, Types } from "mongoose";
import { TaskStatus } from "@jobflow/shared";
import type { CreateTaskInput } from "@jobflow/shared";

type TaskDocument = Omit<CreateTaskInput, "application"> & {
  user: Types.ObjectId;
  application: Types.ObjectId;
};

const taskSchema = new Schema<TaskDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: TaskStatus.options, required: true },
    priority: Number,
  },
  { timestamps: true },
);

taskSchema.index({ user: 1 });
taskSchema.index({ user: 1, application: 1 });
taskSchema.index({ user: 1, application: 1, title: 1 });

export const Task = model<TaskDocument>("Task", taskSchema);
