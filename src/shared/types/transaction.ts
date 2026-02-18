// shared/types/transaction.ts
import type { TransactionDTO, TransactionUpsertInputDTO } from "../schemas/transaction";

export type TransactionId = TransactionDTO["transactionId"];
export type Transaction = TransactionDTO;
export type TransactionUpsertInput = TransactionUpsertInputDTO;
