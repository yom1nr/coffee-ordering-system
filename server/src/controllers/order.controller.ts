import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as orderService from "../services/order.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendCreated, sendPaginated } from "../utils/apiResponse";
import { parsePagination } from "../utils/pagination";

export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user as jwt.JwtPayload | undefined;
  const userId = user ? user.id : null;
  const { items, customerName } = req.body;

  const order = await orderService.createOrder(userId, items, customerName);
  sendCreated(res, { order }, "Order placed successfully.");
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user as jwt.JwtPayload;
  const orders = await orderService.getMyOrders(user.id);
  sendSuccess(res, { orders });
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const pagination = parsePagination(req.query);
  const result = await orderService.getAllOrders(pagination);

  if (result.meta) {
    sendPaginated(res, { orders: result.orders }, result.meta);
  } else {
    sendSuccess(res, { orders: result.orders });
  }
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await orderService.updateOrderStatus(id, status);
  sendSuccess(res, { order }, "Order status updated.");
});