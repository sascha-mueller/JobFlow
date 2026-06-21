import type { RequestHandler } from "express";

import { Application } from "../models/index.ts";
import {
  applicationIdParamsSchema,
  createApplicationSchema,
  updateApplicationSchema,
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

    const application = await Application.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      data,
      { new: true, runValidators: true },
    )
      .populate("company", "name")
      .populate("contact", "name email phone position linkedIn");

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
