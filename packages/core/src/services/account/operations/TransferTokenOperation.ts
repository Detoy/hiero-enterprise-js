import { TransferTransaction } from "@hiero-ledger/sdk";
import type { AccountId, TokenId } from "@hiero-ledger/sdk";
import { BaseOperation } from "../../transaction/index.js";
import type {
    TransactionOptions,
    ScheduleOptions,
} from "../../transaction/index.js";
import { TransferTokenValidator } from "../validation/index.js";

/**
 * Options for fungible token transfers.
 */
export interface TransferTokenOptions extends TransactionOptions {
    /**
     * Expected decimal precision of the token. When set, the SDK verifies
     * that the token's on-chain decimals match — a safety check against
     * sending the wrong magnitude.
     */
    expectedDecimals?: number;
}

/**
 * Options for scheduling a fungible token transfer.
 */
export type ScheduleTransferTokenOptions = TransferTokenOptions &
    ScheduleOptions;

/** Options for `TransferTokenOperation`: the transfer plus transaction options. */
export interface TransferTokenOperationOptions extends TransferTokenOptions {
    /** Token type. */
    tokenId: string | TokenId;
    /** Recipient account. */
    receiverAccountId: string | AccountId;
    /** Amount in the token's smallest unit. */
    amount: number;
    /** Sender account. */
    senderAccountId: string | AccountId;
}

export class TransferTokenOperation extends BaseOperation<TransferTokenOperationOptions> {
    protected readonly type = "CryptoTransfer";
    protected readonly serviceName = "AccountService";
    protected readonly methodName = "transferToken";
    protected readonly validator = new TransferTokenValidator();

    /** Submit a fungible token `TransferTransaction`. */
    async execute(options: TransferTokenOperationOptions) {
        return await this.run(options);
    }

    /** Schedule a fungible token `TransferTransaction`. */
    async schedule(options: TransferTokenOperationOptions & ScheduleOptions) {
        const { payerAccountId, adminKey, scheduleMemo, ...transferOptions } =
            options;
        return await this.scheduleRun(transferOptions, {
            payerAccountId,
            adminKey,
            scheduleMemo,
        });
    }

    protected build(
        options: TransferTokenOperationOptions,
    ): TransferTransaction {
        const { tokenId, receiverAccountId, amount, senderAccountId } = options;
        const tx = new TransferTransaction();

        if (options.expectedDecimals != null) {
            tx.addTokenTransferWithDecimals(
                tokenId,
                senderAccountId,
                -amount,
                options.expectedDecimals,
            );
            tx.addTokenTransferWithDecimals(
                tokenId,
                receiverAccountId,
                amount,
                options.expectedDecimals,
            );
        } else {
            tx.addTokenTransfer(tokenId, senderAccountId, -amount);
            tx.addTokenTransfer(tokenId, receiverAccountId, amount);
        }

        return tx;
    }
}
