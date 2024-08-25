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
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import TransactionList from '~/lib/pages/account/transactionList';
import BankAccountService from '~/lib/services';
import type { Account } from '~/lib/types';

const AccountList = () => {
  const { colorMode } = useColorMode();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => BankAccountService.getAllAccounts(),
  });

  const [selectedAcount, setSelectedAccount] = useState<Account | undefined>();

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
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th />
              <Th>Holder</Th>
              <Th>Number</Th>
              <Th>Description</Th>
              <Th isNumeric>Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((accountItem) => (
              <Tr
                key={accountItem.id}
                onClick={() => setSelectedAccount(accountItem)}
                _hover={{
                  background:
                    colorMode === 'light' ? 'blackAlpha.100' : 'whiteAlpha.100',
                }}
              >
                <Td>
                  <Radio
                    value={`${accountItem.id}`}
                    isChecked={accountItem.id === selectedAcount?.id}
                  />
                </Td>
                <Td>{accountItem.accountHolder}</Td>
                <Td>{accountItem.accountNumber}</Td>
                <Td>{accountItem.description}</Td>
                <Td isNumeric>{accountItem.balance}</Td>
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
      {selectedAcount?.id && (
        <TransactionList
          accountId={selectedAcount.id}
          accountHolder={selectedAcount.accountHolder}
          accountNumber={selectedAcount.accountNumber}
          description={selectedAcount.description}
        />
      )}
    </Flex>
  );
};

export default AccountList;
