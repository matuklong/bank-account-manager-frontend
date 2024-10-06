import axios from 'axios';

import type {
  Account,
  CreateOrUpdateTransactionDTO,
  TransactionType,
} from '~/lib/types';
import { Transaction } from '~/lib/types';

const apiClient = axios.create({
  baseURL: 'https://localhost:7002',
  headers: {
    'Content-type': 'application/json',
  },
});

const getAllAccounts = async (): Promise<Account[]> => {
  const response = await apiClient.get<Account[]>('/account');
  return response.data.map(
    (rest): Account => ({
      ...rest,
      lastTransactionDate: rest.lastTransactionDate
        ? new Date(rest.lastTransactionDate)
        : undefined,
    })
  );
};

const getAccountById = async (accountId: number): Promise<Account[]> => {
  const response = await apiClient.get<Account[]>(
    `/account?accountId=${accountId}`
  );
  return response.data.map(
    (rest): Account => ({
      ...rest,
      lastTransactionDate: rest.lastTransactionDate
        ? new Date(rest.lastTransactionDate)
        : undefined,
    })
  );
};

const getTransactionsByAccountAndDate = async (
  accountId: number,
  startTransactionDate: Date
): Promise<Transaction[]> => {
  const response = await apiClient.get<Transaction[]>('/transaction', {
    params: {
      accountId,
      startTransactionDate,
    },
  });

  return response.data.map((rest) => Transaction.fromJson(rest));
};

const updateTrasanctionType = async (
  transaction: Transaction,
  transactionTypeId: number
): Promise<Transaction | undefined> => {
  const updateURL = `/transaction/${transaction.id}/type/${transactionTypeId}`;
  const response = await apiClient.post<Transaction>(updateURL);

  return Transaction.fromJson(response.data);
};

const getTransactionTypeList = async (): Promise<TransactionType[]> => {
  const response = await apiClient.get<TransactionType[]>('/transaction-type');
  return response.data;
};

const addOrUpdateTransaction = async (
  createOrUpdateTransactionDTO: CreateOrUpdateTransactionDTO
): Promise<Transaction | undefined> => {
  const updateURL = `/transaction`;
  const response = await apiClient.post<Transaction[]>(updateURL, [
    createOrUpdateTransactionDTO,
  ]);

  if (response.data.length > 0) return Transaction.fromJson(response.data[0]);
  return undefined;
};

const deleteTransaction = async (
  transaction: Transaction
): Promise<boolean> => {
  const updateURL = `/transaction`;
  const queryParans = `?transactionId=${transaction.id}&accountId=${transaction.accountId}`;
  const response = await apiClient.delete<Transaction[]>(
    updateURL + queryParans
  );

  return response.status >= 200 && response.status <= 299;
};

// const findById = async (id: any) => {
//   const response = await apiClient.get<Tutorial>(`/tutorials/${id}`);
//   return response.data;
// }

// const findByTitle = async (title: string) => {
//   const response = await apiClient.get<Tutorial[]>(`/tutorials?title=${title}`);
//   return response.data;
// }

// const create = async ({ title, description }: Tutorial) => {
//   const response = await apiClient.post<any>("/tutorials", { title, description });
//   return response.data;
// }

// const update = async (id: any, { title, description, published }: Tutorial) => {
//   const response = await apiClient.put<any>(`/tutorials/${id}`, { title, description, published });
//   return response.data;
// }

// const deleteById = async (id: any) => {
//   const response = await apiClient.delete<any>(`/tutorials/${id}`);
//   return response.data;
// }

// const deleteAll = async () => {
//   const response = await apiClient.delete<any>("/tutorials");
//   return response.data;
// }

const BankAccountService = {
  getAllAccounts,
  getAccountById,
  getTransactionsByAccountAndDate,
  updateTrasanctionType,
  getTransactionTypeList,
  addOrUpdateTransaction,
  deleteTransaction,
};

export default BankAccountService;
