import type { RequestHandler } from "express";

import { Profile } from "../models/index.ts";
import {
  createProfileSchema,
  updateProfileSchema,
} from "@jobflow/shared";
import { AppError } from "../utils/index.ts";

export const createProfile: RequestHandler = async (req, res, next) => {
  try {
    const data = createProfileSchema.parse(req.body);
    const userId = req.user!.id;

    const found = await Profile.findOne({ user: userId });

    if (found) {
      throw new AppError(
        400,
        `User Profile: ${userId} already exists`,
        "PROFILE_EXISTS",
        "WARN",
      );
    }

    const profile = await Profile.create({
      ...data,
      user: userId,
    });

    res.status(201).json(profile);
  } catch (error: unknown) {
    next(error);
  }
};

export const getProfileByUserId: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      throw new AppError(
        404,
        `User Profile: ${userId} not found`,
        "NO_PROFILE",
        "WARN",
      );
    }

    res.json(profile);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const userId = req.user!.id;

    const profile = await Profile.findOneAndUpdate({ user: userId }, data, {
      new: true,
      runValidators: true,
    });

    if (!profile) {
      throw new AppError(
        404,
        `User Profile: ${userId} not found`,
        "NO_PROFILE",
        "WARN",
      );
    }

    res.json(profile);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteProfile: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const profile = await Profile.findOneAndDelete({
      user: userId,
    });

    if (!profile) {
      throw new AppError(
        404,
        `User Profile: ${userId} not found`,
        "NO_PROFILE",
        "WARN",
      );
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};
