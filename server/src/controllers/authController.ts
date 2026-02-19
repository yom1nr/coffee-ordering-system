import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../utils/apiResponse";

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  const result = await authService.registerUser(username, password);
  sendCreated(res, result, "User registered successfully.");
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  const result = await authService.loginUser(username, password);
  sendSuccess(res, result, "Login successful.");
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const payload = req.user as jwt.JwtPayload;
  const user = await authService.getUserProfile(payload.id);
  sendSuccess(res, { user });
});
