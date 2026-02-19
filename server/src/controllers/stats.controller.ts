import { Request, Response } from "express";
import * as statsService from "../services/stats.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const stats = await statsService.getDashboardStats();
  sendSuccess(res, stats);
});