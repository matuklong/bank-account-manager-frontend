'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Radio,
  useColorMode,
  CircularProgress,
  ButtonGroup,
  Button,
  useBoolean,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import BankAccountService from '~/lib/services';
import type {
  Transaction,
  CreateOrUpdateTransactionDTO,
  TransactionUploadFileDTO,
  TransactionUploadFileResponseDTO,
} from '~/lib/types';

import TransactionAddOrUpdate from './transactionAddOrUpdate';
import TransactionDelete from './transactionDelete';
import TransactionTypeEdit from './transactionTypeEdit';
import TransactionUploadFile from './transactionUploadFile';

type TransactionListProps = {
  accountId: number;
  accountHolder: string;
  accountNumber: string;
  description: string;
  handleAccountRefresh: (accountId: number) => void;
};

const TransactionList = ({
  accountId,
  accountHolder,
  accountNumber,
  description,
  handleAccountRefresh,
}: TransactionListProps) => {
  const { colorMode } = useColorMode();

  const queryClient = useQueryClient();

  const [isAddOrUpdateOpen, setAddOrUpdateOpen] = useBoolean();
  const [isDeleteOpen, setDeleteOpen] = useBoolean();
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >();
  const [isUploadFileOpen, setUploadFileOpen] = useBoolean();

  const toast = useToast();

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ['transactions', accountId],
    queryFn: () =>
      BankAccountService.getTransactionsByAccountAndDate(
        accountId,
        new Date(1, 1, 2024)
      ),
  });

  const editTransactionItemType = useMutation({
    mutationFn: async (
      newTransactionType: Transaction
    ): Promise<Transaction> => {
      const updatedTransaction = await BankAccountService.updateTrasanctionType(
        newTransactionType,
        newTransactionType.transactionTypeId ?? 0
      );

      if (!updatedTransaction) {
        throw new Error(
          `Failed to update transaction type id: ${newTransactionType.id} - transactionId: ${newTransactionType.id}`
        );
      }

      return updatedTransaction;
    },
    onSuccess: (item: Transaction) => {
      queryClient.setQueryData(
        ['transactions', item.accountId],
        (prev: Transaction[]) =>
          prev?.map((prevItem) => (prevItem.id === item.id ? item : prevItem))
      );
    },
  });

  const AddOrUpdateTransactionItem = useMutation({
    mutationFn: async (
      createOrUpdateTransactionDTO: CreateOrUpdateTransactionDTO
    ): Promise<Transaction> => {
      const transaction = await BankAccountService.addOrUpdateTransaction(
        createOrUpdateTransactionDTO
      );

      if (!transaction) {
        throw new Error(
          `Failed to add/update transaction id: ${
            createOrUpdateTransactionDTO.id
          }`
        );
      }

      return transaction;
    },
    onSuccess: (item: Transaction) => {
      queryClient.setQueryData(
        ['transactions', item.accountId],
        (prev: Transaction[]) => {
          if (prev.length > 0) handleAccountRefresh(prev[0].accountId);

          let newArray = [];
          if (prev.some((e) => e.id === item.id)) {
            // Item exists, update it
            newArray = prev?.map((prevItem) =>
              prevItem.id === item.id ? item : prevItem
            );
          }
          // Item don't exists, add it
          else newArray = [...prev, item];

          // sort by transaction Date then Id
          newArray.sort((a, b) => {
            if (a.transactionDate < b.transactionDate) return -1;
            if (a.transactionDate > b.transactionDate) return 1;
            return a.id - b.id;
          });

          return newArray;
        }
      );
    },
  });

  const DeleteTransactionItem = useMutation({
    mutationFn: async (transaction: Transaction): Promise<Transaction> => {
      const success = await BankAccountService.deleteTransaction(transaction);

      if (success) return transaction;
      throw new Error(`Failed to delete transaction id: ${transaction.id}`);
    },
    onSuccess: (deleteTransaction: Transaction) => {
      if (!deleteTransaction) return;

      handleAccountRefresh(deleteTransaction.accountId);

      queryClient.setQueryData(
        ['transactions', deleteTransaction.accountId],
        (prev: Transaction[]) =>
          prev?.filter((prevItem) => prevItem.id !== deleteTransaction.id)
      );
    },
  });

  const uploadFileTransactionParse = async (
    transactionUploadFile: TransactionUploadFileDTO
  ): Promise<TransactionUploadFileResponseDTO> => {
    return BankAccountService.uploadFileTransactionParse(transactionUploadFile);
  };

  const uploadFileTransactionProcess = async (
    transactionUploadFile: TransactionUploadFileDTO
  ): Promise<TransactionUploadFileResponseDTO> => {
    const response = await BankAccountService.uploadFileTransactionProcess(
      transactionUploadFile
    );
    refetch();
    return response;
  };

  const handleTransactionRadioClick = (transaction: Transaction) => {
    // console.log('handleTransactionRadioClick', transaction);
    setSelectedTransaction(transaction);
  };

  const handleAddTransaction = () =>
    // e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    {
      setSelectedTransaction(undefined);
      setAddOrUpdateOpen.on();
    };

  const handleEditTransaction = () =>
    // e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    {
      if (selectedTransaction) setAddOrUpdateOpen.on();
      else
        toast({
          title: 'No transaction selected',
          position: 'top',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
    };

  const handleDeleteTransaction = () =>
    // e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    {
      if (selectedTransaction) setDeleteOpen.on();
      else
        toast({
          title: 'No transaction selected',
          position: 'top',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
    };

  const handleUploadCsvFile = () => {
    setUploadFileOpen.on();
  };

  if (isPending) {
    return <CircularProgress />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      gap={4}
      mb={8}
      w="full"
    >
      <div>
        Selected Account: {accountHolder} - {accountNumber} - {description}
      </div>
      <Flex justifyContent="flex-end">
        <ButtonGroup gap="2">
          <Button colorScheme="teal" onClick={handleAddTransaction}>
            Add
          </Button>
          <Button colorScheme="cyan" onClick={handleEditTransaction}>
            Edit
          </Button>
          <Button colorScheme="red" onClick={handleDeleteTransaction}>
            Delete
          </Button>
          <Button colorScheme="yellow" onClick={handleUploadCsvFile}>
            Upload Csv File
          </Button>
        </ButtonGroup>
      </Flex>

      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th />
              <Th>Id</Th>
              <Th>Date</Th>
              <Th>CreatedAt</Th>
              <Th>Description</Th>
              <Th>Balance</Th>
              <Th>Transference</Th>
              <Th>Capitalization</Th>
              <Th isNumeric>Amount</Th>
              <Th>Type</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((transactionItem) => (
              <Tr
                key={transactionItem.id}
                _hover={{
                  background:
                    colorMode === 'light' ? 'blackAlpha.100' : 'whiteAlpha.100',
                }}
              >
                <Td>
                  <Radio
                    onClick={() => handleTransactionRadioClick(transactionItem)}
                    isChecked={transactionItem.id === selectedTransaction?.id}
                    value={`${transactionItem.id}`}
                  />
                </Td>
                <Td>{transactionItem.id}</Td>
                <Td>{transactionItem.transactionDate.toLocaleDateString()}</Td>
                <Td>{transactionItem.createdAt.toLocaleDateString()}</Td>
                <Td>{transactionItem.description}</Td>
                <Td isNumeric>{transactionItem.balanceAtBeforeTransaction}</Td>
                <Td>{transactionItem.transferenceBetweenAccounts}</Td>
                <Td>{transactionItem.capitalizationEvent}</Td>
                <Td isNumeric>{transactionItem.amount}</Td>
                <Td>
                  <TransactionTypeEdit
                    transactionItem={transactionItem}
                    updateTransactionType={editTransactionItemType.mutateAsync}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
          {/* <Tfoot>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th isNumeric>multiply by</Th>
            </Tr>
          </Tfoot> */}
        </Table>
      </TableContainer>
      {isAddOrUpdateOpen && (
        <TransactionAddOrUpdate
          isOpen={isAddOrUpdateOpen}
          onClose={setAddOrUpdateOpen.off}
          transactionItem={selectedTransaction}
          accountId={accountId}
          AddOrUpdateTransactionItem={AddOrUpdateTransactionItem.mutateAsync}
        />
      )}

      {isDeleteOpen && selectedTransaction && (
        <TransactionDelete
          isOpen={isDeleteOpen}
          onClose={setDeleteOpen.off}
          transactionItem={selectedTransaction}
          DeleteTransactionItem={DeleteTransactionItem.mutateAsync}
        />
      )}

      {isUploadFileOpen && (
        <TransactionUploadFile
          isOpen={isUploadFileOpen}
          onClose={setUploadFileOpen.off}
          accountId={accountId}
          uploadFileTransactionParse={uploadFileTransactionParse}
          uploadFileTransactionProcess={uploadFileTransactionProcess}
        />
      )}
    </Flex>
  );
};

export default TransactionList;
