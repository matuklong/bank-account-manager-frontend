'use client';

import {
  useBoolean,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useToast,
} from '@chakra-ui/react';

import type { Transaction } from '~/lib/types';

type TransactionAOrUpdateProps = {
  transactionItem: Transaction;
  isOpen: boolean;
  onClose: () => void;
  DeleteTransactionItem: (transaction: Transaction) => Promise<Transaction>;
};

const TransactionDelete = ({
  transactionItem,
  DeleteTransactionItem,
  isOpen,
  onClose,
}: TransactionAOrUpdateProps) => {
  const [isDeletingBackend, setDeletingBackend] = useBoolean();
  const toast = useToast();

  const handleDeleteConfirmationclick = async () =>
    // e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    {
      // console.log('onSubmit - data received to submmit');
      // console.log(data);
      setDeletingBackend.on();
      try {
        const newTrasaction = await DeleteTransactionItem(transactionItem);

        if (newTrasaction) {
          onClose();
        }
      } catch (error: unknown) {
        let errorMessage = 'Error deleting transaction:';
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
        setDeletingBackend.off();
      }
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`Delete transaction: ${transactionItem.description}?`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <p>
            <b>Date</b>: {transactionItem.transactionDate.toLocaleDateString()}
          </p>
          <p>
            <b>CreatedAt</b>: {transactionItem.createdAt.toLocaleDateString()}
          </p>
          <p>
            <b>Description</b>: {transactionItem.description}
          </p>
          <p>
            <b>Balance</b>: {transactionItem.balanceAtBeforeTransaction}
          </p>
          <p>
            <b>Transference</b>:{' '}
            <Checkbox
              size="lg"
              isChecked={transactionItem.transferenceBetweenAccounts === true}
            />
          </p>
          <p>
            <b>Capitalization</b>:{' '}
            <Checkbox
              size="lg"
              isChecked={transactionItem.capitalizationEvent === true}
            />
          </p>
          <p>
            <b>Amount</b>: {transactionItem.amount}
          </p>
          <p>
            <b>Type</b>: {transactionItem.transactionType?.transactionType}
          </p>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="red"
            mr={3}
            onClick={handleDeleteConfirmationclick}
            isLoading={isDeletingBackend}
          >
            Delete
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionDelete;
