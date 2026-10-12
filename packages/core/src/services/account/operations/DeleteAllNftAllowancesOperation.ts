import { AccountAllowanceApproveTransaction, TokenId } from "@hiero-ledger/sdk";
import { BaseOperation } from "../../transaction/index.js";
import type { TransactionOptions } from "../../transaction/index.js";
import { DeleteAllNftAllowancesValidator } from "../validation/index.js";

/**
 * A single "approve-for-all-serials" NFT allowance revocation — removes the
 * spender's blanket approval for an entire NFT collection owned by
 * `ownerAccountId`.
 *
 * Use this when you previously granted `allSerials: true` via
 * `approveNftAllowance` and want to revoke that blanket grant. For revoking
 * specific serial numbers, use `deleteNftAllowance` instead.
 */
export interface NftAllSerialsAllowanceDeletion {
    /** The token ID for this NFT collection. */
    tokenId: string;
    /** The account that originally granted the allowance (owner). */
    ownerAccountId: string;
    /** The spender whose blanket approval is being revoked. */
    spenderAccountId: string;
}

/**
 * Options for deleting "approve-for-all-serials" NFT allowances on the Hiero
 * network.
 *
 * The owner's key must sign the transaction — pass it via `additionalSigners`
 * unless the operator IS the owner.
 */
export type DeleteAllNftAllowancesOptions = TransactionOptions;

/** Options for `DeleteAllNftAllowancesOperation`: the deletions plus transaction options. */
export interface DeleteAllNftAllowancesOperationOptions extends DeleteAllNftAllowancesOptions {
    /** Approve-for-all-serials deletions to apply. */
    allowances: NftAllSerialsAllowanceDeletion[];
}

export class DeleteAllNftAllowancesOperation extends BaseOperation<DeleteAllNftAllowancesOperationOptions> {
    protected readonly type = "AccountAllowanceApprove";
    protected readonly serviceName = "AccountService";
    protected readonly methodName = "deleteAllNftAllowances";
    protected readonly validator = new DeleteAllNftAllowancesValidator();

    /** Submit the approve-for-all-serials deletions. */
    async execute(options: DeleteAllNftAllowancesOperationOptions) {
        return await this.run(options);
    }

    /**
     * Constructs the `AccountAllowanceApproveTransaction` from allowances. The
     * approve transaction is reused because the protocol routes
     * approve-for-all-serials deletions through the same message type.
     */
    protected build(
        options: DeleteAllNftAllowancesOperationOptions,
    ): AccountAllowanceApproveTransaction {
        const tx = new AccountAllowanceApproveTransaction();

        for (const allowance of options.allowances) {
            tx.deleteTokenNftAllowanceAllSerials(
                TokenId.fromString(allowance.tokenId),
                allowance.ownerAccountId,
                allowance.spenderAccountId,
            );
        }

        return tx;
    }
}
