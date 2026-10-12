import { describe, it, expect } from "vitest";
import { AccountId, Hbar } from "@hiero-ledger/sdk";
import { TransferHbarValidator } from "../../../../../src/services/account/validation/index.js";

describe("TransferHbarValidator", () => {
    const validator = new TransferHbarValidator();

    it("passes with valid string IDs and positive number amount", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 10,
            }),
        ).not.toThrow();
    });

    it("passes with AccountId instances and Hbar amount", () => {
        expect(() =>
            validator.validate({
                senderAccountId: AccountId.fromString("0.0.100"),
                receiverAccountId: AccountId.fromString("0.0.200"),
                amount: new Hbar(5),
            }),
        ).not.toThrow();
    });

    it("throws when senderAccountId is empty string", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "",
                receiverAccountId: "0.0.200",
                amount: 10,
            }),
        ).toThrow(/senderAccountId must not be empty/);
        expect(() =>
            validator.validate({
                senderAccountId: "",
                receiverAccountId: "0.0.200",
                amount: 10,
            }),
        ).toThrow(expect.objectContaining({ code: "INPUT_INVALID" }));
    });

    it("throws when receiverAccountId is empty string", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "   ",
                amount: 10,
            }),
        ).toThrow(/receiverAccountId must not be empty/);
    });

    it("throws when senderAccountId is null", () => {
        expect(() =>
            validator.validate({
                senderAccountId: null as unknown as string,
                receiverAccountId: "0.0.200",
                amount: 10,
            }),
        ).toThrow(/senderAccountId is required/);
    });

    it("throws when sender and receiver are the same string", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.100",
                amount: 10,
            }),
        ).toThrow(/must be different/);
    });

    it("throws when sender and receiver are the same AccountId", () => {
        const account = AccountId.fromString("0.0.100");
        expect(() =>
            validator.validate({
                senderAccountId: account,
                receiverAccountId: account,
                amount: 10,
            }),
        ).toThrow(/must be different/);
    });

    it("throws when sender (string) matches receiver (AccountId)", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: AccountId.fromString("0.0.100"),
                amount: 10,
            }),
        ).toThrow(/must be different/);
    });

    it("throws when amount is zero", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 0,
            }),
        ).toThrow(/amount must be positive/);
    });

    it("throws when amount is negative", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: -5,
            }),
        ).toThrow(/amount must be positive/);
    });

    it("throws when amount is NaN", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: Number.NaN,
            }),
        ).toThrow(/amount must be a finite number/);
    });

    it("throws when amount is Infinity", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: Number.POSITIVE_INFINITY,
            }),
        ).toThrow(/amount must be a finite number/);
    });

    it("throws when Hbar amount is zero", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: new Hbar(0),
            }),
        ).toThrow(/amount must be positive/);
    });

    it("throws when Hbar amount is negative", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: new Hbar(-1),
            }),
        ).toThrow(/amount must be positive/);
    });

    it("throws when amount is null", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: null as unknown as number,
            }),
        ).toThrow(/amount is required/);
    });

    it("throws when amount is undefined", () => {
        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: undefined as unknown as number,
            }),
        ).toThrow(/amount is required/);
    });

    it("throws when Hbar.toTinybars() yields a value BigInt cannot parse", () => {
        // Hbar-like object whose toTinybars().toString() returns a value
        // BigInt() rejects — exercises the catch arm in validateHbarAmount.
        const badHbar = {
            toTinybars: () => ({ toString: () => "not-a-number" }),
        } as unknown as Hbar;

        expect(() =>
            validator.validate({
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: badHbar,
            }),
        ).toThrow(/amount is not a valid Hbar value/);
    });
});
