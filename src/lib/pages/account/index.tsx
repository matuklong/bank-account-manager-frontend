'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tfoot,
  Flex,
  Radio,
  useColorMode,
  CircularProgress,
  useToast,
  Button,
  useBoolean,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';

import AccountInvestmentAddProps from '~/lib/pages/account/accountInvestmentAdd';
import TransactionList from '~/lib/pages/account/transactionList';
import BankAccountService from '~/lib/services';
import type { Account } from '~/lib/types';

const AccountList = () => {
  const { colorMode } = useColorMode();

  const [isAccountInvestmentAdd, setAccountInvestmentAdd] = useBoolean();

  const queryClient = useQueryClient();
  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => BankAccountService.getAllAccounts(),
  });

  const [selectedAcount, setSelectedAccount] = useState<Account | undefined>();
  const toast = useToast();

  const refreshAccount = useMutation({
    mutationFn: async (accountId: number): Promise<Account> => {
      const refreshedAccount =
        await BankAccountService.getAccountById(accountId);

      if (!refreshedAccount || refreshedAccount.length === 0) {
        throw new Error(`Failed to refresh account accountId: ${accountId}`);
      }

      return refreshedAccount[0];
    },
    onSuccess: (item: Account) => {
      queryClient.setQueryData(['accounts'], (prev: Account[]) =>
        prev?.map((prevItem) => (prevItem.id === item.id ? item : prevItem))
      );
    },
  });

  const handleAccountRefresh = async (accountId: number) => {
    // console.log('onSubmit - data received to submmit');
    // console.log(data);
    // setDeletingBackend.on();
    try {
      await refreshAccount.mutateAsync(accountId);
    } catch (e) {
      let errorMessage = 'Error refreshing the account: ';
      if (error instanceof Error) errorMessage += error.message;
      else errorMessage += 'Unknown error';

      toast({
        title: errorMessage,
        position: 'top',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      // console.log('done');
      // setDeletingBackend.off();
    }
  };

  if (isPending) {
    return <CircularProgress />;
  }

  if (isError) {
    if (error instanceof AxiosError && error?.response?.status === 404)
      return <span>We couldn`t find account, please add one</span>;

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
        <Table size="sm" variant="striped">
          <Thead>
            <Tr>
              <Th />
              <Th>Holder</Th>
              <Th>Number</Th>
              <Th>Description</Th>
              <Th>Last Transaction</Th>
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
                <Td>{accountItem.lastTransactionDate?.toLocaleDateString()}</Td>
                <Td isNumeric>
                  {accountItem.balance?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Td>
              </Tr>
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th />
              <Th />
              <Th />
              <Th>
                <Button colorScheme="blue" onClick={setAccountInvestmentAdd.on}>
                  Add Investiments
                </Button>
              </Th>
              <Th>Total: </Th>
              <Th isNumeric>
                {data
                  .reduce(
                    (accumulator, accountItem) =>
                      accumulator + (accountItem?.balance ?? 0),
                    0
                  )
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
              </Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
      {selectedAcount?.id && (
        <TransactionList
          accountId={selectedAcount.id}
          accountHolder={selectedAcount.accountHolder}
          accountNumber={selectedAcount.accountNumber}
          description={selectedAcount.description}
          handleAccountRefresh={handleAccountRefresh}
        />
      )}
      <AccountInvestmentAddProps
        accountList={data}
        refetch={refetch}
        isOpen={isAccountInvestmentAdd}
        onClose={setAccountInvestmentAdd.off}
      />
    </Flex>
  );
};

export default AccountList;
