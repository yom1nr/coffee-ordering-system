import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/AppError";
import logger from "../config/logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    const requestId = req.headers["x-request-id"] || "unknown";

    if (err instanceof ValidationError) {
        logger.warn("Validation error", {
            requestId,
            path: req.path,
            errors: err.errors,
        });

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
        return;
    }

    if (err instanceof AppError) {
        logger.warn("Application error", {
            requestId,
            path: req.path,
            statusCode: err.statusCode,
            message: err.message,
        });

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    logger.error("Unhandled error", {
        requestId,
        path: req.path,
        error: err.message,
        stack: err.stack,
    });

    res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
}
