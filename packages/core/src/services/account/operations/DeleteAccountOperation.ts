import type { PrivateKey, AccountId } from "@hiero-ledger/sdk";
import { AccountDeleteTransaction } from "@hiero-ledger/sdk";
import { BaseOperation } from "../../transaction/index.js";
import type {
    TransactionOptions,
    ScheduleOptions,
} from "../../transaction/index.js";
import { DeleteAccountValidator } from "../validation/index.js";

/**
 * Options for deleting an account and sweeping its remaining balance.
 *
 * Extends `TransactionOptions` for full control over fees, validity window,
 * additional signers, and scheduling.
 */
export interface DeleteAccountOptions extends TransactionOptions {
    /** The account to delete. */
    accountId: string | AccountId;
    /**
     * Private key of the account being deleted — required to authorize deletion.
     * Automatically added as the first signer before the operator auto-sign.
     */
    accountKey: PrivateKey;
    /**
     * Account that receives the remaining balance after deletion.
     * Defaults to the operator account if not provided.
     */
    transferAccountId?: string | AccountId;
}

/**
 * Options for scheduling an account deletion.
 * `accountKey` is omitted — the account owner signs later via
 * `ScheduleSignTransaction` once the schedule is on-chain.
 */
export type ScheduleDeleteAccountOptions = Omit<
    DeleteAccountOptions,
    "accountKey"
>;

export class DeleteAccountOperation extends BaseOperation<ScheduleDeleteAccountOptions> {
    protected readonly type = "AccountDelete";
    protected readonly serviceName = "AccountService";
    protected readonly methodName = "deleteAccount";
    protected readonly validator = new DeleteAccountValidator();

    /** Submit an `AccountDeleteTransaction` signed by the account key. */
    async execute(options: DeleteAccountOptions) {
        this.validator.validateAccountKey(options);
        // Prepend accountKey so it signs the tx before the operator auto-sign
        return await this.run({
            ...options,
            additionalSigners: [
                options.accountKey,
                ...(options.additionalSigners ?? []),
            ],
        });
    }

    /**
     * Schedule account deletion instead of executing immediately.
     *
     * The account owner's signature is collected later via
     * `ScheduleSignTransaction` — no `accountKey` is needed at scheduling time.
     */
    async schedule(
        options: ScheduleDeleteAccountOptions,
        scheduleOptions?: ScheduleOptions,
    ) {
        return await this.scheduleRun(options, scheduleOptions);
    }

    protected build(
        options: ScheduleDeleteAccountOptions,
    ): AccountDeleteTransaction {
        const transferTo =
            options.transferAccountId ??
            this.context.operatorAccountId.toString();

        return new AccountDeleteTransaction()
            .setAccountId(options.accountId)
            .setTransferAccountId(transferTo);
    }
}
