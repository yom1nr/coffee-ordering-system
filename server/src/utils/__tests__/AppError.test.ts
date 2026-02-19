import { describe, it, expect } from "vitest";
import { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError, TooManyRequestsError } from "../AppError";

describe("AppError", () => {
    it("creates error with correct message and status code", () => {
        const error = new AppError("Test error", 400);
        expect(error.message).toBe("Test error");
        expect(error.statusCode).toBe(400);
        expect(error.isOperational).toBe(true);
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
    });

    it("supports non-operational errors", () => {
        const error = new AppError("Fatal", 500, false);
        expect(error.isOperational).toBe(false);
    });
});

describe("NotFoundError", () => {
    it("defaults to 404 with resource name", () => {
        const error = new NotFoundError("Product");
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Product not found.");
    });

    it("uses default resource name", () => {
        const error = new NotFoundError();
        expect(error.message).toBe("Resource not found.");
    });
});

describe("ValidationError", () => {
    it("has 400 status and field errors", () => {
        const errors = { name: ["Name is required."] };
        const error = new ValidationError("Validation failed.", errors);
        expect(error.statusCode).toBe(400);
        expect(error.errors).toEqual(errors);
    });
});

describe("UnauthorizedError", () => {
    it("defaults to 401", () => {
        const error = new UnauthorizedError();
        expect(error.statusCode).toBe(401);
    });
});

describe("ForbiddenError", () => {
    it("defaults to 403", () => {
        const error = new ForbiddenError();
        expect(error.statusCode).toBe(403);
    });
});

describe("ConflictError", () => {
    it("defaults to 409", () => {
        const error = new ConflictError();
        expect(error.statusCode).toBe(409);
    });
});

describe("TooManyRequestsError", () => {
    it("defaults to 429", () => {
        const error = new TooManyRequestsError();
        expect(error.statusCode).toBe(429);
    });
});
