'use client';

import { IconButton, useBoolean, Select } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FaEdit, FaTimes, FaCheck } from 'react-icons/fa';

import BankAccountService from '~/lib/services';
import type { Transaction, TransactionType } from '~/lib/types';

type TransactionTypeEditProps = {
  transactionItem: Transaction;
  updateTransactionType: (transaction: Transaction) => void;
};

type TransactionTypeEditListProps = {
  isPending: boolean;
  isError: boolean;
  data?: TransactionType[];
  currentSelectedItem?: number;
  setSelectedItem: (id: number) => void;
};

const TransactionTypeEditList = ({
  isPending,
  isError,
  data,
  currentSelectedItem,
  setSelectedItem,
}: TransactionTypeEditListProps) => {
  if (isPending) return undefined;

  if (isError) return undefined;

  const dataList = data;
  if (!dataList) return undefined;

  const selectedItemId = currentSelectedItem;

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    if (e.target.value) setSelectedItem(parseInt(e.target.value, 10));
  };

  return (
    <Select
      placeholder={selectedItemId ? 'Select option' : undefined}
      onChange={handleSelectChange}
    >
      {dataList.map((item) => (
        <option
          key={item.id}
          value={item.id}
          selected={item.id === selectedItemId}
        >
          {item.transactionType}
        </option>
      ))}
    </Select>
  );
};

const TransactionTypeEdit = ({
  transactionItem,
  updateTransactionType,
}: TransactionTypeEditProps) => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['transactions-type'],
    queryFn: () => BankAccountService.getTransactionTypeList(),
  });

  const [editMode, setEditMode] = useBoolean();
  const [selectedOption, setSelectedOption] = useState<number | undefined>(
    transactionItem.transactionTypeId
  );

  const handleSelectChange = (id: number) => {
    setSelectedOption(id);
  };

  const handleEditConfirm = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setEditMode.toggle();

    if (!data) return;

    const transactionTypeItem = data.find((item) => item.id === selectedOption);
    if (!transactionTypeItem) return;

    transactionItem.updateTransactionType(transactionTypeItem);
    updateTransactionType(transactionItem);
  };

  if (editMode) {
    // Edit mode
    return (
      <div>
        {isPending && 'Loading...'}
        {isError && `Error: ${error.message}`}
        <TransactionTypeEditList
          isPending={isPending}
          isError={isError}
          data={data}
          currentSelectedItem={selectedOption}
          setSelectedItem={handleSelectChange}
        />
        <IconButton
          aria-label="Cancel"
          icon={<FaTimes />}
          onClick={setEditMode.toggle}
        />
        <IconButton
          aria-label="Confirm"
          icon={<FaCheck />}
          onClick={handleEditConfirm}
        />
      </div>
    );
  }

  return (
    <div>
      {transactionItem.transactionType?.transactionType ?? '-'}
      <IconButton
        aria-label="Edit Type"
        icon={<FaEdit />}
        ml={3}
        onClick={setEditMode.toggle}
      />
    </div>
  );
};

export default TransactionTypeEdit;
