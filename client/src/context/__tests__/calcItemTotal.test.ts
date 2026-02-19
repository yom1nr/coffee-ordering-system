import { describe, it, expect } from "vitest";
import { calcItemTotal } from "../CartContext";
import type { ProductOption } from "../../types";

describe("calcItemTotal", () => {
    // ─── Normal Cases ───
    it("calculates total from basePrice * quantity when no options", () => {
        const options: ProductOption[] = [];
        expect(calcItemTotal(50, options, 2)).toBe(100); // (50 + 0) * 2
    });

    it("calculates total from (basePrice + optionsPrice) * quantity", () => {
        const options: ProductOption[] = [
            { name: "Size L", price: 10, group: "size" },
        ];
        expect(calcItemTotal(50, options, 3)).toBe(180); // (50 + 10) * 3
    });

    // ─── Multiple Options (extra) ───
    it("correctly sums prices across multiple options", () => {
        const options: ProductOption[] = [
            { name: "Size L", price: 10, group: "size" },
            { name: "Whipped Cream", price: 15, group: "topping" },
            { name: "Extra Shot", price: 20, group: "extra" },
        ];
        // (50 + 10 + 15 + 20) * 2 = 190
        expect(calcItemTotal(50, options, 2)).toBe(190);
    });

    // ─── quantity = 0 ───
    it("returns 0 when quantity is 0", () => {
        const options: ProductOption[] = [
            { name: "Size L", price: 10, group: "size" },
        ];
        expect(calcItemTotal(50, options, 0)).toBe(0); // (50 + 10) * 0
    });
});