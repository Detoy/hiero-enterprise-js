import { describe, it, expect } from "vitest";
import { AccountId, TokenId } from "@hiero-ledger/sdk";
import { TransferTokenValidator } from "../../../../../src/services/account/validation/index.js";

describe("TransferTokenValidator", () => {
    const validator = new TransferTokenValidator();

    it("passes with valid string IDs and integer amount", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 100,
            }),
        ).not.toThrow();
    });

    it("passes with TokenId/AccountId instances", () => {
        expect(() =>
            validator.validate({
                tokenId: TokenId.fromString("0.0.456"),
                senderAccountId: AccountId.fromString("0.0.100"),
                receiverAccountId: AccountId.fromString("0.0.200"),
                amount: 100,
            }),
        ).not.toThrow();
    });

    it("passes with valid expectedDecimals", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 100,
                expectedDecimals: 6,
            }),
        ).not.toThrow();
    });

    it("passes with expectedDecimals zero", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 100,
                expectedDecimals: 0,
            }),
        ).not.toThrow();
    });

    it("throws when tokenId is empty string", () => {
        expect(() =>
            validator.validate({
                tokenId: "",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 100,
            }),
        ).toThrow(/tokenId must not be empty/);
    });

    it("throws when tokenId is null", () => {
        expect(() =>
            validator.validate({
                tokenId: null as unknown as string,
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 100,
            }),
        ).toThrow(/tokenId is required/);
    });

    it("throws when sender equals receiver", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.100",
                amount: 100,
            }),
        ).toThrow(/must be different/);
    });

    it("throws when amount is zero", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 0,
            }),
        ).toThrow(/amount must be positive/);
    });

    it("throws when amount is negative", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: -1,
            }),
        ).toThrow(/amount must be positive/);
    });

    it("throws when amount is not an integer", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 1.5,
            }),
        ).toThrow(/amount must be a safe integer/);
    });

    it("throws when amount is null", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: null as unknown as number,
            }),
        ).toThrow(/amount is required/);
    });

    it("throws when expectedDecimals is negative", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 100,
                expectedDecimals: -1,
            }),
        ).toThrow(/expectedDecimals cannot be negative/);
    });

    it("throws when expectedDecimals is not an integer", () => {
        expect(() =>
            validator.validate({
                tokenId: "0.0.456",
                senderAccountId: "0.0.100",
                receiverAccountId: "0.0.200",
                amount: 100,
                expectedDecimals: 2.5,
            }),
        ).toThrow(/expectedDecimals must be a finite integer/);
    });
});
