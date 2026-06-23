import type { RequestHandler } from "express";

import { runFollowUpSuggestion } from "./ai.service.ts";
import { appIdParamsSchema } from "@jobflow/shared";

export const createFollowUpSuggestion: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = appIdParamsSchema.parse(req.params);

    const task = await runFollowUpSuggestion({
      userId: req.user!.id,
      appId: id,
    });

    res.status(201).json(task);
  } catch (error: unknown) {
    next(error);
  }
};
