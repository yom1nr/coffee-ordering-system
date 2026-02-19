import { describe, it, expect } from "vitest";
import { parsePagination, buildPaginationMeta } from "../pagination";

describe("parsePagination", () => {
    it("returns defaults for empty query", () => {
        const result = parsePagination({});
        expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
    });

    it("parses valid page and limit", () => {
        const result = parsePagination({ page: "3", limit: "10" });
        expect(result).toEqual({ page: 3, limit: 10, offset: 20 });
    });

    it("clamps negative page to 1", () => {
        const result = parsePagination({ page: "-5", limit: "10" });
        expect(result.page).toBe(1);
        expect(result.offset).toBe(0);
    });

    it("clamps limit above MAX_LIMIT (100) to 100", () => {
        const result = parsePagination({ page: "1", limit: "999" });
        expect(result.limit).toBe(100);
    });

    it("handles NaN values gracefully", () => {
        const result = parsePagination({ page: "abc", limit: "xyz" });
        expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
    });
});

describe("buildPaginationMeta", () => {
    it("calculates totalPages correctly", () => {
        const meta = buildPaginationMeta(95, { page: 1, limit: 20, offset: 0 });
        expect(meta).toEqual({
            page: 1,
            limit: 20,
            total: 95,
            totalPages: 5,
        });
    });

    it("returns 1 totalPage for small datasets", () => {
        const meta = buildPaginationMeta(3, { page: 1, limit: 20, offset: 0 });
        expect(meta.totalPages).toBe(1);
    });

    it("returns 0 totalPages for empty datasets", () => {
        const meta = buildPaginationMeta(0, { page: 1, limit: 20, offset: 0 });
        expect(meta.totalPages).toBe(0);
    });
});
