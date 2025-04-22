import axios from 'axios';

import type {
  Account,
  CreateOrUpdateTransactionDTO,
  TransactionType,
  TransactionUploadFileDTO,
  TransactionUploadFileResponseDTO,
  TransactionUploadFileResponseItemDTO,
} from '~/lib/types';
import { Transaction } from '~/lib/types';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REACT_APP_API_BASE_URL,
  headers: {
    'Content-type': 'application/json',
  },
});

const getAllAccounts = async (): Promise<Account[]> => {
  const response = await apiClient.get<Account[]>('/api/account');
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
  const response = await apiClient.get<Transaction[]>('/api/transaction', {
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
  const updateURL = `/api/transaction/${transaction.id}/type/${transactionTypeId}`;
  const response = await apiClient.post<Transaction>(updateURL);

  return Transaction.fromJson(response.data);
};

const getTransactionTypeList = async (): Promise<TransactionType[]> => {
  const response = await apiClient.get<TransactionType[]>(
    '/api/transaction-type'
  );
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
  const updateURL = `/api/transaction`;
  const queryParans = `?transactionId=${transaction.id}&accountId=${transaction.accountId}`;
  const response = await apiClient.delete<Transaction[]>(
    updateURL + queryParans
  );

  return response.status >= 200 && response.status <= 299;
};

const uploadFile = async (
  urlEndpoint: string,
  transactionUploadFile: TransactionUploadFileDTO
): Promise<TransactionUploadFileResponseDTO> => {
  const header = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const formData = new FormData(); // make a bew FormData for every file.
  formData.append(
    'fileUpload',
    transactionUploadFile.fileUpload,
    transactionUploadFile.fileUpload.name
  );
  formData.append('accountId', transactionUploadFile.accountId.toString());

  const response = await apiClient.post<TransactionUploadFileResponseItemDTO[]>(
    urlEndpoint,
    formData,
    header
  );
  if (response.data.length > 0) return { items: response.data };
  return { items: [] };
};

const uploadFileTransactionParse = async (
  transactionUploadFile: TransactionUploadFileDTO
): Promise<TransactionUploadFileResponseDTO> => {
  const urlEndpoint = `/api/transaction/parse-file`;
  return uploadFile(urlEndpoint, transactionUploadFile);
};

const uploadFileTransactionProcess = async (
  transactionUploadFile: TransactionUploadFileDTO
): Promise<TransactionUploadFileResponseDTO> => {
  const urlEndpoint = `/api/transaction/upload-file`;
  return uploadFile(urlEndpoint, transactionUploadFile);
};

const reprocessUndefinedTypes = async (
  accountId: number,
  startTransactionDate: Date
): Promise<boolean> => {
  const urlEndpoint = `/api/transaction/reprocess-undefined-types`;

  const response = await apiClient.post(urlEndpoint, {
    accountId,
    startTransactionDate,
  });

  return response.status === 200;
};

const BankAccountService = {
  getAllAccounts,
  getAccountById,
  getTransactionsByAccountAndDate,
  updateTrasanctionType,
  getTransactionTypeList,
  addOrUpdateTransaction,
  deleteTransaction,
  uploadFileTransactionParse,
  uploadFileTransactionProcess,
  reprocessUndefinedTypes,
};

export default BankAccountService;
