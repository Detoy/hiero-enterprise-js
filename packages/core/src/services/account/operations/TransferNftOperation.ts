import { NftId, TokenId, TransferTransaction } from "@hiero-ledger/sdk";
import type { AccountId } from "@hiero-ledger/sdk";
import { BaseOperation } from "../../transaction/index.js";
import type {
    TransactionOptions,
    ScheduleOptions,
} from "../../transaction/index.js";
import { TransferNftValidator } from "../validation/index.js";

/**
 * Options for NFT transfers — inherits all base transaction options.
 */
export type TransferNftOptions = TransactionOptions;

/**
 * Options for scheduling an NFT transfer.
 */
export type ScheduleTransferNftOptions = TransferNftOptions & ScheduleOptions;

/** Options for `TransferNftOperation`: the transfer plus transaction options. */
export interface TransferNftOperationOptions extends TransferNftOptions {
    /** NFT collection token ID. */
    tokenId: string | TokenId;
    /** Serial number of the NFT. */
    serial: number;
    /** Recipient account. */
    receiverAccountId: string | AccountId;
    /** Sender account. */
    senderAccountId: string | AccountId;
}

export class TransferNftOperation extends BaseOperation<TransferNftOperationOptions> {
    protected readonly type = "CryptoTransfer";
    protected readonly serviceName = "AccountService";
    protected readonly methodName = "transferNft";
    protected readonly validator = new TransferNftValidator();

    /** Submit an NFT `TransferTransaction`. */
    async execute(options: TransferNftOperationOptions) {
        return await this.run(options);
    }

    /** Schedule an NFT `TransferTransaction`. */
    async schedule(options: TransferNftOperationOptions & ScheduleOptions) {
        const { payerAccountId, adminKey, scheduleMemo, ...transferOptions } =
            options;
        return await this.scheduleRun(transferOptions, {
            payerAccountId,
            adminKey,
            scheduleMemo,
        });
    }

    protected build(options: TransferNftOperationOptions): TransferTransaction {
        const tokenId =
            typeof options.tokenId === "string"
                ? TokenId.fromString(options.tokenId)
                : options.tokenId;
        const nftId = new NftId(tokenId, options.serial);

        return new TransferTransaction().addNftTransfer(
            nftId,
            options.senderAccountId,
            options.receiverAccountId,
        );
    }
}
