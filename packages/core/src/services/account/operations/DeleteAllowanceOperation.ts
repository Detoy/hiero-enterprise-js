import {
    AccountAllowanceDeleteTransaction,
    TokenId,
    NftId,
} from "@hiero-ledger/sdk";
import { BaseOperation } from "../../transaction/index.js";
import type { TransactionOptions } from "../../transaction/index.js";
import { DeleteAllowanceValidator } from "../validation/index.js";

/**
 * A single NFT allowance deletion — removes the spender's approval for
 * the specified serial numbers of an NFT collection owned by `ownerAccountId`.
 *
 * Note: The Hiero protocol only supports per-serial NFT allowance deletion via
 * `AccountAllowanceDeleteTransaction`. To remove HBAR or fungible token
 * allowances, set the amount to `0` using `approveHbarAllowance` /
 * `approveTokenAllowance`. To remove an "approve for all serials" grant,
 * use `AccountAllowanceApproveTransaction.deleteTokenNftAllowanceAllSerials`.
 */
export interface NftAllowanceDeletion {
    /** The token ID for this NFT collection. */
    tokenId: string;
    /** The account that originally granted the allowance (owner). */
    ownerAccountId: string;
    /** Specific serial numbers to revoke. Must contain at least one entry. */
    serialNumbers: number[];
}

/**
 * Options for deleting NFT allowances on the Hiero network.
 *
 * The owner's key must sign the transaction — pass it via `additionalSigners`
 * unless the operator IS the owner.
 */
export type DeleteAllowanceOptions = TransactionOptions;

/** Options for `DeleteAllowanceOperation`: the deletions plus transaction options. */
export interface DeleteAllowanceOperationOptions extends DeleteAllowanceOptions {
    /** NFT allowance deletions to apply. */
    allowances: NftAllowanceDeletion[];
}

export class DeleteAllowanceOperation extends BaseOperation<DeleteAllowanceOperationOptions> {
    protected readonly type = "AccountAllowanceDelete";
    protected readonly serviceName = "AccountService";
    protected readonly methodName = "deleteNftAllowance";
    protected readonly validator = new DeleteAllowanceValidator();

    /** Submit an `AccountAllowanceDeleteTransaction`. */
    async execute(options: DeleteAllowanceOperationOptions) {
        return await this.run(options);
    }

    /**
     * Constructs the `AccountAllowanceDeleteTransaction` from allowances.
     */
    protected build(
        options: DeleteAllowanceOperationOptions,
    ): AccountAllowanceDeleteTransaction {
        const tx = new AccountAllowanceDeleteTransaction();

        for (const allowance of options.allowances) {
            for (const serial of allowance.serialNumbers) {
                const nftId = new NftId(
                    TokenId.fromString(allowance.tokenId),
                    serial,
                );
                tx.deleteAllTokenNftAllowances(nftId, allowance.ownerAccountId);
            }
        }

        return tx;
    }
}
