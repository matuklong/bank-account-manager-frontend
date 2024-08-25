import type { Account } from './account';

export interface ITransaction {
  id: number;
  amount: number;
  transactionDate: Date;
  createdAt: Date;
  description?: string;
  balanceAtBeforeTransaction: number;
  capitalizationEvent: boolean;
  transferenceBetweenAccounts: boolean;
  accountId: number;
  transactionTypeId?: number;
  account: Account;
  transactionType?: TransactionType;

  updateTransactionType(transactionType: TransactionType): void;
}

export class Transaction implements ITransaction {
  id!: number;

  amount!: number;

  transactionDate!: Date;

  createdAt!: Date;

  description?: string;

  balanceAtBeforeTransaction!: number;

  capitalizationEvent!: boolean;

  transferenceBetweenAccounts!: boolean;

  accountId!: number;

  transactionTypeId?: number;

  account!: Account;

  transactionType?: TransactionType;

  updateTransactionType = (transactionType: TransactionType): void => {
    this.transactionTypeId = transactionType.id;
    this.transactionType = transactionType;
  };

  static fromJson = (json: ITransaction): Transaction => {
    return Object.assign(new Transaction(), json, {
      transactionDate: new Date(json.transactionDate),
      createdAt: new Date(json.createdAt),
    });
  };
}

export interface TransactionType {
  id: number;
  transactionType: string;
  transactionTypeString: TransactionTypeIdentificator[];
}

export interface TransactionTypeIdentificator {
  id: number;
  description?: string;
  expectedAmount?: number;
  transactionTypeId: number;
}
