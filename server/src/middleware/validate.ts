import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/AppError";

export function validate(schema: ZodSchema) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const fieldErrors: Record<string, string[]> = {};
                for (const issue of err.issues) {
                    const key = issue.path.join(".");
                    if (!fieldErrors[key]) fieldErrors[key] = [];
                    fieldErrors[key].push(issue.message);
                }
                next(new ValidationError("Validation failed.", fieldErrors));
                return;
            }
            next(err);
        }
    };
}
