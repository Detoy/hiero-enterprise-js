import type { AccountId, Hbar } from "@hiero-ledger/sdk";
import { validationError } from "../../../errors/index.js";
import type { TransferHbarOperationOptions } from "../operations/TransferHbarOperation.js";

/**
 * Validates inputs to `TransferHbarOperation` before building the SDK
 * transaction.
 *
 * Catches common bugs the network would otherwise reject (or silently accept)
 * — empty IDs, non-positive amounts and self transfers.
 */
export class TransferHbarValidator {
    /**
     * Validate transfer options before any SDK construction.
     *
     * @param options - The caller-provided transfer options
     * @throws {HieroError} If validation fails
     */
    validate(options: TransferHbarOperationOptions): void {
        this.validateAccountId(options.senderAccountId, "senderAccountId");
        this.validateAccountId(options.receiverAccountId, "receiverAccountId");
        this.validateDistinctAccounts(
            options.senderAccountId,
            options.receiverAccountId,
        );
        this.validateHbarAmount(options.amount);
    }

    private validateAccountId(
        value: string | AccountId | null | undefined,
        paramName: string,
    ): void {
        if (value == null) {
            throw validationError(
                "TransferHbarValidator",
                `${paramName} is required.`,
            );
        }
        if (typeof value === "string" && value.trim() === "") {
            throw validationError(
                "TransferHbarValidator",
                `${paramName} must not be empty.`,
            );
        }
    }

    private validateDistinctAccounts(
        sender: string | AccountId,
        receiver: string | AccountId,
    ): void {
        if (sender.toString() === receiver.toString()) {
            throw validationError(
                "TransferHbarValidator",
                "senderAccountId and receiverAccountId must be different — transferring to self is a no-op.",
            );
        }
    }

    private validateHbarAmount(amount: number | Hbar | null | undefined): void {
        if (amount == null) {
            throw validationError(
                "TransferHbarValidator",
                "amount is required.",
            );
        }

        if (typeof amount === "number") {
            if (!Number.isFinite(amount)) {
                throw validationError(
                    "TransferHbarValidator",
                    "amount must be a finite number.",
                );
            }
            if (amount <= 0) {
                throw validationError(
                    "TransferHbarValidator",
                    "amount must be positive.",
                );
            }
            return;
        }

        // Hbar instance — compare tinybars via BigInt for precision.
        let tinybars: bigint;
        try {
            tinybars = BigInt(amount.toTinybars().toString());
        } catch {
            throw validationError(
                "TransferHbarValidator",
                "amount is not a valid Hbar value.",
            );
        }
        if (tinybars <= 0n) {
            throw validationError(
                "TransferHbarValidator",
                "amount must be positive.",
            );
        }
    }
}
