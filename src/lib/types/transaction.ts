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

  cloneUpdateTransactionType(transactionType: TransactionType): void;
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

  cloneUpdateTransactionType = (
    transactionType: TransactionType
  ): Transaction => {
    return {
      ...this,
      transactionTypeId: transactionType.id,
      transactionType,
    };
  };

  static fromJson = (json: ITransaction): Transaction => {
    return Object.assign(new Transaction(), json, {
      transactionDate: new Date(json.transactionDate),
      createdAt: new Date(json.createdAt),
    });
  };
}

export interface CreateOrUpdateTransactionDTO {
  id?: number;
  amount: number;
  transactionDate: Date;
  description?: string;
  capitalizationEvent: boolean;
  transferenceBetweenAccounts: boolean;
  accountId: number;
  transactionTypeId?: number;
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
