import type { RequestHandler } from "express";

import { Company } from "../models/index.ts";
import {
  companyIdParamsSchema,
  createCompanySchema,
  updateCompanySchema,
} from "@jobflow/shared";
import { AppError } from "../utils/index.ts";

export const getCompanies: RequestHandler = async (req, res, next) => {
  try {
    const companies = await Company.find({ user: req.user!.id });

    res.json(companies);
  } catch (error: unknown) {
    next(error);
  }
};

export const createCompany: RequestHandler = async (req, res, next) => {
  try {
    const data = createCompanySchema.parse(req.body);
    const userId = req.user!.id;

    const found = await Company.findOne({
      name: data.name,
      user: userId,
    });

    if (found) {
      throw new AppError(
        400,
        `Company: ${data.name} already exists`,
        "COMPANY_EXISTS",
        "WARN",
      );
    }

    const company = await Company.create({
      ...data,
      user: userId,
    });

    res.status(201).json(company);
  } catch (error: unknown) {
    next(error);
  }
};

export const getCompanyById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = companyIdParamsSchema.parse(req.params);
    const company = await Company.findOne({ _id: id, user: req.user!.id });

    if (!company) {
      throw new AppError(404, `Company: ${id} not found`, "NO_COMPANY", "WARN");
    }

    res.json(company);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateCompany: RequestHandler = async (req, res, next) => {
  try {
    const { id } = companyIdParamsSchema.parse(req.params);
    const data = updateCompanySchema.parse(req.body);

    const company = await Company.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!company) {
      throw new AppError(404, `Company: ${id} not found`, "NO_COMPANY", "WARN");
    }

    res.json(company);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteCompany: RequestHandler = async (req, res, next) => {
  try {
    const { id } = companyIdParamsSchema.parse(req.params);
    const company = await Company.findOneAndDelete({
      _id: id,
      user: req.user!.id,
    });

    if (!company) {
      throw new AppError(404, `Company: ${id} not found`, "NO_COMPANY", "WARN");
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};
