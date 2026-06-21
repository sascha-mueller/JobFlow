import type { RequestHandler } from "express";

import { Task, Application } from "../models/index.ts";
import {
  taskIdParamsSchema,
  createTaskSchema,
  updateTaskSchema,
} from "@jobflow/shared";
import { AppError } from "../utils/index.ts";

export const getTasks: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const tasks = await Task.find({ user: userId });

    res.json(tasks);
  } catch (error: unknown) {
    next(error);
  }
};

export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const data = createTaskSchema.parse(req.body);
    const userId = req.user!.id;

    const app = await Application.findOne({
      _id: data.application,
      user: userId,
    });

    if (!app) {
      throw new AppError(
        404,
        `Application: ${data.application} not found`,
        "NO_APP",
        "WARN",
      );
    }

    const found = await Task.findOne({
      title: data.title,
      user: userId,
      application: data.application,
    });

    if (found) {
      throw new AppError(
        400,
        `Task: ${data.title} already exists`,
        "TASK_EXISTS",
        "WARN",
      );
    }

    const task = await Task.create({
      ...data,
      user: userId,
    });

    res.status(201).json(task);
  } catch (error: unknown) {
    next(error);
  }
};

export const getTaskById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = taskIdParamsSchema.parse(req.params);
    const task = await Task.findOne({ _id: id, user: req.user!.id });

    if (!task) {
      throw new AppError(404, `Task: ${id} not found`, "NO_TASK", "WARN");
    }

    res.json(task);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const { id } = taskIdParamsSchema.parse(req.params);
    const data = updateTaskSchema.parse(req.body);
    const userId = req.user!.id;

    if (data.application) {
      const app = await Application.findOne({
        _id: data.application,
        user: userId,
      });

      if (!app) {
        throw new AppError(
          404,
          `Application: ${data.application} not found`,
          "NO_APP",
          "WARN",
        );
      }
    }

    const task = await Task.findOneAndUpdate({ _id: id, user: userId }, data, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      throw new AppError(404, `Task: ${id} not found`, "NO_TASK", "WARN");
    }

    res.json(task);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const { id } = taskIdParamsSchema.parse(req.params);
    const task = await Task.findOneAndDelete({
      _id: id,
      user: req.user!.id,
    });

    if (!task) {
      throw new AppError(404, `Task: ${id} not found`, "NO_TASK", "WARN");
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};
