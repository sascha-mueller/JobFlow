import type { RequestHandler } from "express";

import { Application } from "../models/index.ts";
import {
  applicationHistoryParamsSchema,
  applicationIdParamsSchema,
  createApplicationSchema,
  updateApplicationSchema,
  updateStatusHistoryEntrySchema,
} from "@jobflow/shared";
import { AppError } from "../utils/index.ts";

export const getApplications: RequestHandler = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user!.id })
      .populate("company", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(applications);
  } catch (error: unknown) {
    next(error);
  }
};

export const createApplication: RequestHandler = async (req, res, next) => {
  try {
    const data = createApplicationSchema.parse(req.body);

    const application = await Application.create({
      ...data,
      user: req.user!.id,
      statusHistory: [{ status: data.status, changedAt: new Date() }],
    });

    res.status(201).json(application);
  } catch (error: unknown) {
    next(error);
  }
};

export const getApplicationById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = applicationIdParamsSchema.parse(req.params);
    const application = await Application.findOne({
      _id: id,
      user: req.user!.id,
    })
      .populate("company", "name")
      .populate("contact", "name email phone position linkedIn")
      .lean();

    if (!application) {
      throw new AppError(
        404,
        `Application: ${id} not found`,
        "NO_APPLICATION",
        "WARN",
      );
    }

    res.json(application);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateApplication: RequestHandler = async (req, res, next) => {
  try {
    const { id } = applicationIdParamsSchema.parse(req.params);
    const data = updateApplicationSchema.parse(req.body);

    const application = await Application.findOne({ _id: id, user: req.user!.id });

    if (!application) {
      throw new AppError(
        404,
        `Application: ${id} not found`,
        "NO_APPLICATION",
        "WARN",
      );
    }

    if (data.status && data.status !== application.status) {
      application.statusHistory.push({ status: data.status, changedAt: new Date() });
    }

    Object.assign(application, data);
    await application.save();

    await application.populate("company", "name");
    await application.populate("contact", "name email phone position linkedIn");

    res.json(application);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateStatusHistoryEntry: RequestHandler = async (req, res, next) => {
  try {
    const { id, historyId } = applicationHistoryParamsSchema.parse(req.params);
    const data = updateStatusHistoryEntrySchema.parse(req.body);

    const application = await Application.findOne({ _id: id, user: req.user!.id });

    if (!application) {
      throw new AppError(
        404,
        `Application: ${id} not found`,
        "NO_APPLICATION",
        "WARN",
      );
    }

    const entry = application.statusHistory.id(historyId);

    if (!entry) {
      throw new AppError(
        404,
        `Status history entry: ${historyId} not found`,
        "NO_STATUS_HISTORY_ENTRY",
        "WARN",
      );
    }

    entry.changedAt = new Date(data.changedAt);
    await application.save();

    await application.populate("company", "name");
    await application.populate("contact", "name email phone position linkedIn");

    res.json(application);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteApplication: RequestHandler = async (req, res, next) => {
  try {
    const { id } = applicationIdParamsSchema.parse(req.params);
    const application = await Application.findOneAndDelete({
      _id: id,
      user: req.user!.id,
    });

    if (!application) {
      throw new AppError(
        404,
        `Application: ${id} not found`,
        "NO_APPLICATION",
        "WARN",
      );
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};
