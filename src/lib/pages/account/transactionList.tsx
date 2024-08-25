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
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import BankAccountService from '~/lib/services';
import { Transaction } from '~/lib/types';

import TransactionTypeEdit from './transactionTypeEdit';

type TransactionListProps = {
  accountId: number;
  accountHolder: string;
  accountNumber: string;
  description: string;
};

const TransactionList = ({
  accountId,
  accountHolder,
  accountNumber,
  description,
}: TransactionListProps) => {
  const { colorMode } = useColorMode();

  const queryClient = useQueryClient();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['transactions', accountId],
    queryFn: () =>
      BankAccountService.getTransactionsByAccountAndDate(
        accountId,
        new Date(1, 1, 2024)
      ),
  });

  const editTransactionItem = useMutation({
    mutationFn: async (newTransactionType: Transaction) => {
      return (
        (await BankAccountService.updateTrasanctionType(
          newTransactionType,
          newTransactionType.transactionTypeId ?? 0
        )) ?? newTransactionType
      );
    },
    onSuccess: (item: Transaction) => {
      queryClient.setQueryData(
        ['transactions', accountId],
        (prev: Transaction[]) =>
          prev?.map((prevItem) =>
            prevItem.id === item.id ? Transaction.fromJson(item) : prevItem
          )
      );
    },
  });

  if (isPending) {
    return <span>Loading...</span>;
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

      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th />
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
                key={transactionItem.id} // onClick={()=> }
                _hover={{
                  background:
                    colorMode === 'light' ? 'blackAlpha.100' : 'whiteAlpha.100',
                }}
              >
                <Td>
                  <Radio
                    value={`${transactionItem.id}`} /* isChecked={accountItem.id == selectedAcount} */
                  />
                </Td>
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
                    updateTransactionType={editTransactionItem.mutate}
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
    </Flex>
  );
};

export default TransactionList;
