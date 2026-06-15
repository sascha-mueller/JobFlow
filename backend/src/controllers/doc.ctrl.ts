import type { RequestHandler } from "express";

import { DocumentModel } from "../models/index.ts";
import {
  documentIdParamsSchema,
  createDocumentSchema,
  updateDocumentSchema,
} from "@jobflow/shared";
import { AppError } from "../utils/index.ts";

export const getDocuments: RequestHandler = async (req, res, next) => {
  try {
    const documents = await DocumentModel.find({ user: req.user!.id });

    res.json(documents);
  } catch (error: unknown) {
    next(error);
  }
};

export const createDocument: RequestHandler = async (req, res, next) => {
  try {
    // TODO:
    // Remove duplicate schema.parse() calls after migrating fully
    // to validation middleware.
    const data = createDocumentSchema.parse(req.body);
    const userId = req.user!.id;

    // TODO:
    // Validate that the referenced application belongs to the authenticated user
    // once the Application module is implemented.
    const found = await DocumentModel.findOne({
      user: userId,
      application: data.application,
      originalFileName: data.originalFileName,
    });

    if (found) {
      throw new AppError(
        400,
        `Document: ${data.originalFileName} for application ${data.application} already exists`,
        "DOCUMENT_EXISTS",
        "WARN",
      );
    }

    const document = await DocumentModel.create({
      ...data,
      user: userId,
    });

    res.status(201).json(document);
  } catch (error: unknown) {
    next(error);
  }
};

export const getDocumentById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = documentIdParamsSchema.parse(req.params);
    const document = await DocumentModel.findOne({
      _id: id,
      user: req.user!.id,
    });

    if (!document) {
      throw new AppError(
        404,
        `Document: ${id} not found`,
        "NO_DOCUMENT",
        "WARN",
      );
    }

    res.json(document);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateDocument: RequestHandler = async (req, res, next) => {
  try {
    const { id } = documentIdParamsSchema.parse(req.params);
    const data = updateDocumentSchema.parse(req.body);

    const document = await DocumentModel.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!document) {
      throw new AppError(
        404,
        `Document: ${id} not found`,
        "NO_DOCUMENT",
        "WARN",
      );
    }

    res.json(document);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteDocument: RequestHandler = async (req, res, next) => {
  try {
    const { id } = documentIdParamsSchema.parse(req.params);
    const document = await DocumentModel.findOneAndDelete({
      _id: id,
      user: req.user!.id,
    });

    if (!document) {
      throw new AppError(
        404,
        `Document: ${id} not found`,
        "NO_DOCUMENT",
        "WARN",
      );
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};
