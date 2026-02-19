import { Response } from "express";

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ApiSuccessResponse<T> {
    success: true;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export function sendSuccess<T>(res: Response, data: T, message = "Success", statusCode = 200): void {
    const body: ApiSuccessResponse<T> = { success: true, message, data };
    res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message = "Created successfully."): void {
    sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(
    res: Response,
    data: T,
    meta: PaginationMeta,
    message = "Success"
): void {
    const body: ApiSuccessResponse<T> & { meta: PaginationMeta } = {
        success: true,
        message,
        data,
        meta,
    };
    res.status(200).json(body);
}
