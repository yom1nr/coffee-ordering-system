import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendCreated, sendPaginated } from "../utils/apiResponse";
import { parsePagination } from "../utils/pagination";

export const getAllProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { category, includeInactive, page, limit } = req.query;
  const pagination = (page || limit) ? parsePagination(req.query) : undefined;

  const result = await productService.getAllProducts({
    category: typeof category === "string" ? category : undefined,
    includeInactive: !!includeInactive,
    pagination,
  });

  if (result.meta) {
    sendPaginated(res, { products: result.products }, result.meta);
  } else {
    sendSuccess(res, { products: result.products });
  }
});

export const getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, { product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productService.createProduct(req.body);
  sendCreated(res, { product }, "Product created successfully.");
});

export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, { product }, "Product updated successfully.");
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const hard = req.query.hard === "true";
  const result = await productService.deleteProduct(req.params.id, hard);
  sendSuccess(res, null, result.message);
});
