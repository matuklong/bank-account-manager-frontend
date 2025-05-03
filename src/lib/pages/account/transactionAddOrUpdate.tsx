'use client';

import {
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  Button,
  FormErrorMessage,
  Select,
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { pt } from 'date-fns/locale/pt';
import DatePicker, { registerLocale } from 'react-datepicker';
import type { SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import 'react-datepicker/dist/react-datepicker.css';

import BankAccountService from '~/lib/services';
import type { CreateOrUpdateTransactionDTO, Transaction } from '~/lib/types';

registerLocale('pt', pt);

type TransactionAddOrUpdateProps = {
  transactionItem?: Transaction;
  accountId: number;
  isOpen: boolean;
  onClose: () => void;
  AddOrUpdateTransactionItem: (
    transaction: CreateOrUpdateTransactionDTO
  ) => Promise<Transaction>;
};

type TransactionAddOrUpdateForm = {
  transactionDate: Date;
  description: string;
  amount: string;
  transactionTypeId?: number;
  capitalizationEvent: boolean;
  transferenceBetweenAccounts: boolean;
};

const TransactionAddOrUpdate = ({
  transactionItem,
  accountId,
  AddOrUpdateTransactionItem,
  isOpen,
  onClose,
}: TransactionAddOrUpdateProps) => {
  const transactionTypeQuery = useQuery({
    queryKey: ['transactions-type'],
    queryFn: () => BankAccountService.getTransactionTypeList(),
  });

  const toast = useToast();

  const schema = yup.object().shape({
    transactionDate: yup.date().required(),
    description: yup.string().required(),
    amount: yup
      .string()
      .required('Amount is required')
      .transform((value) => {
        const locale = navigator.language || 'en-US'; // Get the browser's locale or fallback to 'en-US'
        const formatter = new Intl.NumberFormat(locale);
        const parts = formatter.formatToParts(12345.67); // Example number to detect separators
        const decimalSeparator =
          parts.find((part) => part.type === 'decimal')?.value || '.';
        const groupSeparator =
          parts.find((part) => part.type === 'group')?.value || ',';

        // Remove invalid characters (letters, extra symbols)
        const sanitizedValue = value.replace(/[^0-9.,]/g, '');

        // Replace group separator and normalize decimal separator
        const normalizedValue = sanitizedValue
          .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
          .replace(decimalSeparator, '.');

        // Parse the normalized value into a number
        const parsedValue = parseFloat(normalizedValue);

        // Return the parsed value as a string or null if invalid
        return Number.isNaN(parsedValue) ? null : parsedValue.toString();
      })
      .test('is-valid-number', 'Invalid number format', (value) => {
        const parsedValue = parseFloat(value); // Convert string to number
        return !Number.isNaN(parsedValue); // Check if it's a valid number
      }),
    transactionTypeId: yup.number(),
    capitalizationEvent: yup.boolean().required(),
    transferenceBetweenAccounts: yup.boolean().required(),
  });

  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TransactionAddOrUpdateForm>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      transactionDate: transactionItem?.transactionDate ?? new Date(),
      description: transactionItem?.description ?? '',
      amount: transactionItem?.amount?.toString() ?? '',
      transactionTypeId: transactionItem?.transactionTypeId,
      capitalizationEvent: transactionItem?.capitalizationEvent ?? false,
      transferenceBetweenAccounts:
        transactionItem?.transferenceBetweenAccounts ?? false,
    },
  });

  const onSubmit: SubmitHandler<TransactionAddOrUpdateForm> = async (data) => {
    // console.log('onSubmit - data received to submmit');
    // console.log(data);

    try {
      const newTrasaction = await AddOrUpdateTransactionItem({
        id: transactionItem?.id,
        transactionDate: data.transactionDate,
        description: data.description,
        amount: parseFloat(data.amount),
        transactionTypeId: data.transactionTypeId,
        capitalizationEvent: data.capitalizationEvent,
        transferenceBetweenAccounts: data.transferenceBetweenAccounts,
        accountId,
      });

      if (newTrasaction) {
        onClose();
        reset();
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

  const onInvalid: SubmitErrorHandler<TransactionAddOrUpdateForm> = () => {
    // console.log('onInvalid - data received to submmit');
    // console.log(e);
    // reset();
  };

  // console.log(errors);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <ModalHeader>
            {transactionItem
              ? `Edit transaction: ${transactionItem.description}`
              : 'Add Transaction'}
          </ModalHeader>
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

            <FormControl mt={4} isInvalid={!!errors.description}>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Input
                id="description"
                placeholder="Description"
                {...register('description', {
                  required: 'This is required',

                  // minLength: { value: 4, message: 'Minimum length should be 4' },
                })}
              />

              <FormErrorMessage>
                {errors.description && errors.description.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl mt={4} isInvalid={!!errors.amount}>
              <FormLabel htmlFor="amount">Amount</FormLabel>
              <Input
                id="amount"
                placeholder="Amount"
                {...register('amount', {
                  required: 'This is required',
                  // minLength: { value: 4, message: 'Minimum length should be 4' },
                })}
              />

              <FormErrorMessage>
                {errors.amount && errors.amount.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl mt={4} isInvalid={!!errors.capitalizationEvent}>
              <Controller
                control={control}
                name="capitalizationEvent"
                // defaultValue={transactionItem?.capitalizationEvent ?? false} // Set the initial value to the current date
                render={({ field: { onChange, value } }) => (
                  <Checkbox size="lg" onChange={onChange} isChecked={value}>
                    Capitalization Event
                  </Checkbox>
                )}
              />
              <FormErrorMessage>
                {errors.capitalizationEvent &&
                  errors.capitalizationEvent.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              mt={4}
              isInvalid={!!errors.transferenceBetweenAccounts}
            >
              <Controller
                control={control}
                name="transferenceBetweenAccounts"
                // defaultValue={transactionItem?.transferenceBetweenAccounts ?? false} // Set the initial value to the current date
                render={({ field: { onChange, value } }) => (
                  <Checkbox size="lg" onChange={onChange} isChecked={value}>
                    Transference Between Accounts
                  </Checkbox>
                )}
              />
              <FormErrorMessage>
                {errors.transferenceBetweenAccounts &&
                  errors.transferenceBetweenAccounts.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl mt={4} isInvalid={!!errors.transactionTypeId}>
              <Controller
                control={control}
                name="transactionTypeId"
                // defaultValue={transactionItem?.transactionTypeId ?? false} // Set the initial value to the current date
                render={({ field: { onChange, value } }) => (
                  <Select size="lg" onChange={onChange}>
                    {transactionTypeQuery.data?.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        selected={item.id === value}
                      >
                        {item.transactionType}
                      </option>
                    ))}
                  </Select>
                )}
              />
              <FormErrorMessage>
                {errors.transactionTypeId && errors.transactionTypeId.message}
              </FormErrorMessage>
            </FormControl>
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

export default TransactionAddOrUpdate;
