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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  ModalFooter,
  FormErrorMessage,
  useToast,
  Textarea,
  Tfoot,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { pt } from 'date-fns/locale/pt';
import { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import type { SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';

import BankAccountService from '~/lib/services';
import type {
  Account,
  MatchedInvestmentAccount,
  Transaction,
} from '~/lib/types';
import { parseInvestmentData, matchInvestmentsToAccounts } from '~/lib/util';

type AccountInvestmentAddProps = {
  accountList: Account[];
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
};

type InvestmentListAddForm = {
  transactionDate: Date;
  multipleItems: string;
};

registerLocale('pt', pt);

const AccountInvestmentAdd = ({
  accountList,
  isOpen,
  onClose,
  refetch,
}: AccountInvestmentAddProps) => {
  const [investmentList, setInvestmentList] = useState<
    MatchedInvestmentAccount[] | undefined
  >();

  const toast = useToast();

  const schema = yup.object().shape({
    transactionDate: yup.date().required(),
    multipleItems: yup.string().required('Investment string is required'),
  });

  // get date closer to the end of the month
  let endOfTheMonthDate: Date;
  const currentDate = new Date();
  if (currentDate.getDate() > 25) {
    // Set the date to the first day of the next month
    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    // Subtract one day to get the last day of the current month
    endOfTheMonthDate = new Date(firstDayOfNextMonth.getTime() - 1);
  } else {
    // Set the date to the first day of the current month
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    // Subtract one day to get the last day of the previous month
    endOfTheMonthDate = new Date(firstDayOfCurrentMonth.getTime() - 1);
  }

  // Ensure the date has no time component
  endOfTheMonthDate.setHours(0, 0, 0, 0);

  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<InvestmentListAddForm>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      transactionDate: endOfTheMonthDate,
      multipleItems: '',
    },
  });

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.multipleItems) {
        try {
          const result = parseInvestmentData(value.multipleItems);
          const matchedAccounts = matchInvestmentsToAccounts(
            result,
            accountList
          );
          setInvestmentList(matchedAccounts);
        } catch (error) {
          toast({
            title: `Error parsing investment data: ${(error as Error).message}`,
            position: 'top',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          // console.error('Error parsing investment data:', error);
          setInvestmentList(undefined);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, accountList, toast]);

  const onSubmit: SubmitHandler<InvestmentListAddForm> = async (data) => {
    // console.log('onSubmit - data received to submmit');
    // console.log(data);

    try {
      const transactionList = investmentList
        ?.filter(
          (matchedInvestment) =>
            !!matchedInvestment.investment &&
            matchedInvestment.investmentValue !== 0
        )
        .map((matchedInvestment) => {
          return {
            transactionDate: data.transactionDate,
            description: '-',
            amount: matchedInvestment.investmentValue ?? 0,
            transactionTypeId: undefined,
            capitalizationEvent: false,
            transferenceBetweenAccounts: false,
            accountId: matchedInvestment.account.id,
          };
        });

      const awaitableTasks: Promise<Transaction | undefined>[] = [];
      transactionList?.forEach((transaction) => {
        awaitableTasks.push(
          BankAccountService.addOrUpdateTransaction(transaction)
        );
      });

      const allResponse = await Promise.all(awaitableTasks);

      if (
        allResponse.filter((response) => response !== undefined).length ===
        transactionList?.length
      ) {
        refetch();
        onClose();
        reset();
        setInvestmentList(undefined);
      }
    } catch (error: unknown) {
      let errorMessage = 'Error submitting transaction:';
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
    }
  };

  const onInvalid: SubmitErrorHandler<InvestmentListAddForm> = () => {
    // console.log('onInvalid - data received to submmit');
    // console.log(e);
    // reset();
  };

  const totalBalanceMatched = investmentList?.reduce(
    (acc, item) => acc + (item.investment ? item.account.balance : 0),
    0
  );
  const totalInvestiment = investmentList?.reduce(
    (acc, item) => acc + (item.investment?.value ?? 0),
    0
  );
  const totalInvestimentValue = investmentList?.reduce(
    (acc, item) => acc + (item.investmentValue ?? 0),
    0
  );
  const totalInvestimentValuePercentageCount = investmentList?.reduce(
    (count, item) => count + (item.investmentPercentage ? 1 : 0),
    0
  );
  const avgInvestimentPercentage =
    totalInvestimentValuePercentageCount &&
    totalInvestimentValuePercentageCount !== 0 &&
    investmentList
      ? investmentList.reduce(
          (acc, item) => acc + (item.investmentPercentage ?? 0),
          0
        ) / totalInvestimentValuePercentageCount
      : 0; // Fallback to 0 if undefined

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="5xl"
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <ModalHeader>Add Investiment List</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.transactionDate}>
              <FormLabel htmlFor="transactionDate">Transaction Date</FormLabel>

              <Controller
                control={control}
                name="transactionDate"
                // defaultValue={transactionItem?.transactionDate ?? new Date()} // Set the initial value to the current date
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    locale="pt"
                    dateFormat="dd/MM/yyyy"
                    onChange={onChange}
                    selected={value ? new Date(value) : null}
                  />
                )}
              />
              <FormErrorMessage>
                {errors.transactionDate && errors.transactionDate.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl mt={4} isInvalid={!!errors.multipleItems}>
              <FormLabel htmlFor="multipleItems">
                Description (1 per line)
              </FormLabel>
              <Textarea
                id="multipleItems"
                size="md"
                placeholder="Insert one account per line"
                {...register('multipleItems', {
                  required: 'This is required',

                  // minLength: { value: 4, message: 'Minimum length should be 4' },
                })}
              />

              <FormErrorMessage>
                {errors.multipleItems && errors.multipleItems.message}
              </FormErrorMessage>
            </FormControl>

            {investmentList && investmentList.length > 0 && (
              <Flex>
                <TableContainer mt={4}>
                  <Table size="sm" variant="striped">
                    <Thead>
                      <Tr>
                        <Th>Description</Th>
                        <Th isNumeric>Current Balance</Th>
                        <Th>Localized</Th>
                        <Th isNumeric>New Balance</Th>
                        <Th isNumeric>Value</Th>
                        <Th isNumeric>%</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {investmentList.map((matchedInvestment) => (
                        <Tr key={matchedInvestment.account.id}>
                          <Td>{matchedInvestment.account.description}</Td>
                          <Td isNumeric>
                            {matchedInvestment.account.balance.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </Td>
                          <Td>{matchedInvestment.investment?.name}</Td>
                          <Td isNumeric>
                            {matchedInvestment.investment?.value?.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </Td>
                          <Td
                            isNumeric
                            color={
                              (matchedInvestment.investmentValue ?? 0) < 0
                                ? 'red.500'
                                : 'green.500'
                            }
                          >
                            {matchedInvestment.investmentValue?.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </Td>
                          <Td
                            isNumeric
                            color={
                              (matchedInvestment.investmentPercentage ?? 0) < 0
                                ? 'red.500'
                                : 'green.500'
                            }
                          >
                            {matchedInvestment.investmentPercentage
                              ? `${matchedInvestment.investmentPercentage.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )} %`
                              : ''}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <Tfoot>
                      <Tr>
                        <Th>Total</Th>
                        <Th isNumeric>
                          {totalBalanceMatched?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </Th>
                        <Th />
                        <Th isNumeric>
                          {totalInvestiment?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </Th>
                        <Th isNumeric>
                          {totalInvestimentValue?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Th>
                        <Th isNumeric>
                          {avgInvestimentPercentage?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          %
                        </Th>
                      </Tr>
                    </Tfoot>
                  </Table>
                </TableContainer>
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              type="submit"
              isLoading={isSubmitting}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AccountInvestmentAdd;
