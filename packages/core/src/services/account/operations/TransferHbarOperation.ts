import { Hbar, TransferTransaction } from "@hiero-ledger/sdk";
import type { AccountId } from "@hiero-ledger/sdk";
import { BaseOperation } from "../../transaction/index.js";
import type {
    TransactionOptions,
    ScheduleOptions,
} from "../../transaction/index.js";
import { TransferHbarValidator } from "../validation/index.js";

/**
 * Options for HBAR transfers — inherits all base transaction options.
 *
 * The sender and receiver are passed positionally for a clear call site.
 * When the sender is not the operator, pass the sender's signing key via
 * `additionalSigners`.
 */
export type TransferHbarOptions = TransactionOptions;

/**
 * Options for scheduling an HBAR transfer — combines transaction options
 * with the schedule fields (`payerAccountId`, `adminKey`, `scheduleMemo`).
 */
export type ScheduleTransferHbarOptions = TransferHbarOptions & ScheduleOptions;

/** Options for `TransferHbarOperation`: the transfer plus transaction options. */
export interface TransferHbarOperationOptions extends TransferHbarOptions {
    /** Recipient account. */
    receiverAccountId: string | AccountId;
    /** Amount in HBAR (number) or an `Hbar` instance for tinybar precision. */
    amount: number | Hbar;
    /** Sender account. */
    senderAccountId: string | AccountId;
}

export class TransferHbarOperation extends BaseOperation<TransferHbarOperationOptions> {
    protected readonly type = "CryptoTransfer";
    protected readonly serviceName = "AccountService";
    protected readonly methodName = "transferHbar";
    protected readonly validator = new TransferHbarValidator();

    /** Submit an HBAR `TransferTransaction`. */
    async execute(options: TransferHbarOperationOptions) {
        return await this.run(options);
    }

    /** Schedule an HBAR `TransferTransaction`. */
    async schedule(options: TransferHbarOperationOptions & ScheduleOptions) {
        const { payerAccountId, adminKey, scheduleMemo, ...transferOptions } =
            options;
        return await this.scheduleRun(transferOptions, {
            payerAccountId,
            adminKey,
            scheduleMemo,
        });
    }

    protected build(
        options: TransferHbarOperationOptions,
    ): TransferTransaction {
        const hbarAmount =
            options.amount instanceof Hbar
                ? options.amount
                : new Hbar(options.amount);

        return new TransferTransaction()
            .addHbarTransfer(options.senderAccountId, hbarAmount.negated())
            .addHbarTransfer(options.receiverAccountId, hbarAmount);
    }
}
