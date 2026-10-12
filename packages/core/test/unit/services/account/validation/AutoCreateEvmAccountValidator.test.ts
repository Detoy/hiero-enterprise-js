import { describe, it, expect } from "vitest";
import { Hbar } from "@hiero-ledger/sdk";
import { AutoCreateEvmAccountValidator } from "../../../../../src/services/account/validation/index.js";

describe("AutoCreateEvmAccountValidator", () => {
    const validator = new AutoCreateEvmAccountValidator();
    const evmAddress = "0x" + "a".repeat(40);

    describe("evmAddress", () => {
        it("passes with a 0x-prefixed address", () => {
            expect(() =>
                validator.validate({ evmAddress, amount: 1 }),
            ).not.toThrow();
        });

        it("passes without the 0x prefix", () => {
            expect(() =>
                validator.validate({ evmAddress: "A".repeat(40), amount: 1 }),
            ).not.toThrow();
        });

        it("throws when evmAddress is missing", () => {
            expect(() =>
                validator.validate({
                    evmAddress: undefined as unknown as string,
                    amount: 1,
                }),
            ).toThrow(/evmAddress is required/);
            expect(() =>
                validator.validate({
                    evmAddress: undefined as unknown as string,
                    amount: 1,
                }),
            ).toThrow(expect.objectContaining({ code: "INPUT_INVALID" }));
        });

        it("throws when evmAddress is empty", () => {
            expect(() =>
                validator.validate({ evmAddress: "", amount: 1 }),
            ).toThrow(/evmAddress must be 40 hex characters/);
        });

        it("throws when evmAddress has the wrong length", () => {
            expect(() =>
                validator.validate({
                    evmAddress: "0x" + "a".repeat(39),
                    amount: 1,
                }),
            ).toThrow(/evmAddress must be 40 hex characters/);
        });

        it("throws when evmAddress is not hex", () => {
            expect(() =>
                validator.validate({
                    evmAddress: "0x" + "g".repeat(40),
                    amount: 1,
                }),
            ).toThrow(/evmAddress must be 40 hex characters/);
        });
    });

    describe("amount", () => {
        it("passes with an Hbar instance", () => {
            expect(() =>
                validator.validate({
                    evmAddress,
                    amount: Hbar.fromTinybars(1),
                }),
            ).not.toThrow();
        });

        it("throws when amount is missing", () => {
            expect(() =>
                validator.validate({
                    evmAddress,
                    amount: undefined as unknown as number,
                }),
            ).toThrow(/amount is required/);
        });

        it("throws when amount is not finite", () => {
            expect(() =>
                validator.validate({ evmAddress, amount: Number.NaN }),
            ).toThrow(/amount must be a finite number/);
        });

        it("throws when amount is zero", () => {
            expect(() => validator.validate({ evmAddress, amount: 0 })).toThrow(
                /amount must be positive/,
            );
        });

        it("throws when an Hbar amount is negative", () => {
            expect(() =>
                validator.validate({
                    evmAddress,
                    amount: Hbar.fromTinybars(-1),
                }),
            ).toThrow(/amount must be positive/);
        });
    });
});
