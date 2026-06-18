import type { RequestHandler } from "express";

import { Company, Contact } from "../models/index.ts";
import {
  contactIdParamsSchema,
  createContactSchema,
  updateContactSchema,
} from "@jobflow/shared";
import { AppError } from "../utils/index.ts";

export const getContacts: RequestHandler = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ user: req.user!.id });

    res.json(contacts);
  } catch (error: unknown) {
    next(error);
  }
};

export const createContact: RequestHandler = async (req, res, next) => {
  try {
    const data = createContactSchema.parse(req.body);
    const userId = req.user!.id;

    const found = await Contact.findOne({
      email: data.email,
      user: userId,
    });

    if (found) {
      throw new AppError(
        400,
        `Contact: ${data.name} already exists`,
        "CONTACT_EXISTS",
        "WARN",
      );
    }

    if (data.company) {
      const company = await Company.findOne({
        _id: data.company,
        user: req.user!.id,
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

    const contact = await Contact.create({
      ...data,
      user: userId,
    });

    res.status(201).json(contact);
  } catch (error: unknown) {
    next(error);
  }
};

export const getContactById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = contactIdParamsSchema.parse(req.params);
    const contact = await Contact.findOne({ _id: id, user: req.user!.id });

    if (!contact) {
      throw new AppError(404, `Contact: ${id} not found`, "NO_CONTACT", "WARN");
    }

    res.json(contact);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateContact: RequestHandler = async (req, res, next) => {
  try {
    const { id } = contactIdParamsSchema.parse(req.params);
    const data = updateContactSchema.parse(req.body);

    if (data.company) {
      const company = await Company.findOne({
        _id: data.company,
        user: req.user!.id,
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

    const contact = await Contact.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!contact) {
      throw new AppError(404, `Contact: ${id} not found`, "NO_CONTACT", "WARN");
    }

    res.json(contact);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteContact: RequestHandler = async (req, res, next) => {
  try {
    const { id } = contactIdParamsSchema.parse(req.params);
    const contact = await Contact.findOneAndDelete({
      _id: id,
      user: req.user!.id,
    });

    if (!contact) {
      throw new AppError(404, `Contact: ${id} not found`, "NO_CONTACT", "WARN");
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};
