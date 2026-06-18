import type { RequestHandler } from "express";

import { Application, Company, Contact } from "../models/index.ts";
import {
  appIdParamsSchema,
  createApplicationSchema,
  updateApplicationSchema,
} from "@jobflow/shared";
import { AppError } from "../utils/index.ts";

export const getApps: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const apps = await Application.find({ user: userId });

    res.json(apps);
  } catch (error: unknown) {
    next(error);
  }
};

export const createApp: RequestHandler = async (req, res, next) => {
  try {
    const data = createApplicationSchema.parse(req.body);
    const userId = req.user!.id;

    if (data.company) {
      const company = await Company.findOne({
        _id: data.company,
        user: userId,
      });

      if (!company) {
        throw new AppError(
          404,
          `Company: ${data.company} not found`,
          "NO_COMPANY",
          "WARN",
        );
      }
    }

    if (data.contact) {
      const contact = await Contact.findOne({
        _id: data.contact,
        user: userId,
      });

      if (!contact) {
        throw new AppError(
          404,
          `Contact: ${data.contact} not found`,
          "NO_CONTACT",
          "WARN",
        );
      }
    }

    const found = await Application.findOne({
      name: data.name,
      user: userId,
    });

    if (found) {
      throw new AppError(
        400,
        `Application: ${data.name} already exists`,
        "APP_EXISTS",
        "WARN",
      );
    }

    const app = await Application.create({
      ...data,
      user: userId,
    });

    res.status(201).json(app);
  } catch (error: unknown) {
    next(error);
  }
};

export const getAppById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = appIdParamsSchema.parse(req.params);
    const app = await Application.findOne({ _id: id, user: req.user!.id });

    if (!app) {
      throw new AppError(404, `Application: ${id} not found`, "NO_APP", "WARN");
    }

    res.json(app);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateApp: RequestHandler = async (req, res, next) => {
  try {
    const { id } = appIdParamsSchema.parse(req.params);
    const data = updateApplicationSchema.parse(req.body);
    const userId = req.user!.id;

    if (data.company) {
      const company = await Company.findOne({
        _id: data.company,
        user: userId,
      });

      if (!company) {
        throw new AppError(
          404,
          `Company: ${data.company} not found`,
          "NO_COMPANY",
          "WARN",
        );
      }
    }

    if (data.contact) {
      const contact = await Contact.findOne({
        _id: data.contact,
        user: userId,
      });

      if (!contact) {
        throw new AppError(
          404,
          `Contact: ${data.contact} not found`,
          "NO_CONTACT",
          "WARN",
        );
      }
    }

    const app = await Application.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!app) {
      throw new AppError(404, `Application: ${id} not found`, "NO_APP", "WARN");
    }

    res.json(app);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteApp: RequestHandler = async (req, res, next) => {
  try {
    const { id } = appIdParamsSchema.parse(req.params);
    const app = await Application.findOneAndDelete({
      _id: id,
      user: req.user!.id,
    });

    if (!app) {
      throw new AppError(404, `Application: ${id} not found`, "NO_APP", "WARN");
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};
