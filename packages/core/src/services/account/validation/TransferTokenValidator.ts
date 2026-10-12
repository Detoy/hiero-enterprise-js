import type { AccountId, TokenId } from "@hiero-ledger/sdk";
import { validationError } from "../../../errors/index.js";
import type { TransferTokenOperationOptions } from "../operations/TransferTokenOperation.js";

/**
 * Validates inputs to `TransferTokenOperation` before building the SDK
 * transaction.
 *
 * Catches common bugs the network would otherwise reject (or silently accept)
 * — empty IDs, non-positive or non-integer amounts and self transfers.
 */
export class TransferTokenValidator {
    /**
     * Validate transfer options before any SDK construction.
     *
     * @param options - The caller-provided transfer options
     * @throws {HieroError} If validation fails
     */
    validate(options: TransferTokenOperationOptions): void {
        this.validateTokenId(options.tokenId);
        this.validateAccountId(options.senderAccountId, "senderAccountId");
        this.validateAccountId(options.receiverAccountId, "receiverAccountId");
        this.validateDistinctAccounts(
            options.senderAccountId,
            options.receiverAccountId,
        );
        this.validateTokenAmount(options.amount);
        if (options.expectedDecimals !== undefined) {
            this.validateExpectedDecimals(options.expectedDecimals);
        }
    }

    private validateAccountId(
        value: string | AccountId | null | undefined,
        paramName: string,
    ): void {
        if (value == null) {
            throw validationError(
                "TransferTokenValidator",
                `${paramName} is required.`,
            );
        }
        if (typeof value === "string" && value.trim() === "") {
            throw validationError(
                "TransferTokenValidator",
                `${paramName} must not be empty.`,
            );
        }
    }

    private validateTokenId(value: string | TokenId | null | undefined): void {
        if (value == null) {
            throw validationError(
                "TransferTokenValidator",
                "tokenId is required.",
            );
        }
        if (typeof value === "string" && value.trim() === "") {
            throw validationError(
                "TransferTokenValidator",
                "tokenId must not be empty.",
            );
        }
    }

    private validateDistinctAccounts(
        sender: string | AccountId,
        receiver: string | AccountId,
    ): void {
        if (sender.toString() === receiver.toString()) {
            throw validationError(
                "TransferTokenValidator",
                "senderAccountId and receiverAccountId must be different — transferring to self is a no-op.",
            );
        }
    }

    private validateTokenAmount(amount: number | null | undefined): void {
        if (amount == null) {
            throw validationError(
                "TransferTokenValidator",
                "amount is required.",
            );
        }
        if (!Number.isFinite(amount) || !Number.isSafeInteger(amount)) {
            throw validationError(
                "TransferTokenValidator",
                "amount must be a safe integer.",
            );
        }
        if (amount <= 0) {
            throw validationError(
                "TransferTokenValidator",
                "amount must be positive.",
            );
        }
    }

    private validateExpectedDecimals(decimals: number): void {
        if (!Number.isFinite(decimals) || !Number.isInteger(decimals)) {
            throw validationError(
                "TransferTokenValidator",
                "expectedDecimals must be a finite integer.",
            );
        }
        if (decimals < 0) {
            throw validationError(
                "TransferTokenValidator",
                "expectedDecimals cannot be negative.",
            );
        }
    }
}
