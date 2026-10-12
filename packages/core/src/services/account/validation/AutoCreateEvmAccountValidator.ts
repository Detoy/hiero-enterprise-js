import type { Hbar } from "@hiero-ledger/sdk";
import { validationError } from "../../../errors/index.js";
import type { AutoCreateEvmAccountOptions } from "../operations/AutoCreateEvmAccountOperation.js";

const EVM_ADDRESS = /^(0x)?[0-9a-fA-F]{40}$/;

/**
 * Validates caller-provided options before the AutoCreateEvmAccountOperation
 * builds or submits any transaction.
 *
 * Separated from the operation so validation logic is independently testable
 * without requiring network interaction.
 */
export class AutoCreateEvmAccountValidator {
    /**
     * Validate auto-create options before any SDK construction.
     *
     * @param options - The caller-provided auto-create options
     * @throws {HieroError} If validation fails
     */
    validate(options: AutoCreateEvmAccountOptions): void {
        this.validateEvmAddress(options.evmAddress);
        this.validateAmount(options.amount);
    }

    private validateEvmAddress(value: string | null | undefined): void {
        if (value == null) {
            throw validationError(
                "AutoCreateEvmAccountValidator",
                "evmAddress is required.",
            );
        }
        if (!EVM_ADDRESS.test(value)) {
            throw validationError(
                "AutoCreateEvmAccountValidator",
                "evmAddress must be 40 hex characters, optionally prefixed with 0x.",
            );
        }
    }

    private validateAmount(amount: number | Hbar | null | undefined): void {
        if (amount == null) {
            throw validationError(
                "AutoCreateEvmAccountValidator",
                "amount is required.",
            );
        }

        if (typeof amount === "number") {
            if (!Number.isFinite(amount)) {
                throw validationError(
                    "AutoCreateEvmAccountValidator",
                    "amount must be a finite number.",
                );
            }
            if (amount <= 0) {
                throw validationError(
                    "AutoCreateEvmAccountValidator",
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
                "AutoCreateEvmAccountValidator",
                "amount is not a valid Hbar value.",
            );
        }
        if (tinybars <= 0n) {
            throw validationError(
                "AutoCreateEvmAccountValidator",
                "amount must be positive.",
            );
        }
    }
}
