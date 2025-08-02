'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
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
  useToast,
  useColorMode,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { pt } from 'date-fns/locale/pt';
import { useState } from 'react';
import { registerLocale } from 'react-datepicker';
import type { SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import 'react-datepicker/dist/react-datepicker.css';
import type {
  TransactionUploadFileResponseDTO,
  TransactionUploadFileDTO,
  TransactionUploadFileResponseItemDTO,
} from '~/lib/types';

registerLocale('pt', pt);

type TransactionUploadFileProps = {
  accountId: number;
  isOpen: boolean;
  onClose: () => void;
  uploadFileTransactionParse: (
    transaction: TransactionUploadFileDTO
  ) => Promise<TransactionUploadFileResponseDTO>;
  uploadFileTransactionProcess: (
    transaction: TransactionUploadFileDTO
  ) => Promise<TransactionUploadFileResponseDTO>;
};

type TransactionUploadFileForm = {
  fileUpload: File[];
};

type TransactionUploadFileScreenData = {
  parsePhase: boolean;
  processPhase: boolean;
  endPhase: boolean;
  transactionUploadFileResponseDTO: TransactionUploadFileResponseDTO;
};

const initiateTransactionUploadFileScreenData =
  (): TransactionUploadFileScreenData => {
    return {
      parsePhase: true,
      processPhase: false,
      endPhase: false,
      transactionUploadFileResponseDTO: { items: [] },
    };
  };

const MAX_FILE_SIZE = 102_400; // 100KB

const TransactionUploadFile = ({
  accountId,
  isOpen,
  onClose,
  uploadFileTransactionParse,
  uploadFileTransactionProcess,
}: TransactionUploadFileProps) => {
  // Control Parse or Upload.
  const [uploadScreenPhase, setUploadScreenPhase] =
    useState<TransactionUploadFileScreenData>(
      initiateTransactionUploadFileScreenData()
    );

  const toast = useToast();
  const { colorMode } = useColorMode();

  // Define the test functions for validation
  const fileSizeTest: yup.TestFunction<File[] | null> = (value) => {
    return value && value.length === 1 ? value[0].size <= MAX_FILE_SIZE : false; // 2MB limit
  };

  const fileTypeTest: yup.TestFunction<File[] | null> = (value) => {
    return value && value.length === 1
      ? value[0].type === 'text/csv' || value[0].type === 'text/plain'
      : false; // Accept only CSV and TXT files
  };

  const schema = yup.object({
    fileUpload: yup
      .mixed<File[]>()
      .required('You need to provide a file')
      .test('fileSize', 'The file is too large', fileSizeTest)
      .test('fileType', 'Unsupported file format', fileTypeTest),
  });

  const {
    register,
    reset,
    handleSubmit,
    // control,
    formState: { errors, isSubmitting },
  } = useForm<TransactionUploadFileForm>({
    resolver: yupResolver(schema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // setValue('file', file); // Update form value with the selected file
      // setFileChanged(true); // Mark that the file has been changed
      setUploadScreenPhase(initiateTransactionUploadFileScreenData());
    }
  };

  const onSubmit: SubmitHandler<TransactionUploadFileForm> = async (data) => {
    // console.log('onSubmit - data received to submmit');
    // console.log(data);

    try {
      // console.log(data);

      let response: TransactionUploadFileResponseDTO;

      const requestData = {
        accountId,
        fileUpload: data.fileUpload[0],
      };

      if (uploadScreenPhase.parsePhase) {
        // Make the file list empty to show the new processed data.
        setUploadScreenPhase({
          ...uploadScreenPhase,
          transactionUploadFileResponseDTO: { items: [] },
        });
        response = await uploadFileTransactionParse(requestData);
        setUploadScreenPhase({
          ...uploadScreenPhase,
          parsePhase: false,
          processPhase: true,
          transactionUploadFileResponseDTO: response,
        });
      } else if (uploadScreenPhase.processPhase) {
        // Make the file list empty to show the new processed data.
        setUploadScreenPhase({
          ...uploadScreenPhase,
          transactionUploadFileResponseDTO: { items: [] },
        });
        response = await uploadFileTransactionProcess(requestData);
        setUploadScreenPhase({
          ...uploadScreenPhase,
          parsePhase: false,
          processPhase: false,
          endPhase: true,
          transactionUploadFileResponseDTO: response,
        });

        reset();
      }
    } catch (error: unknown) {
      let errorMessage = 'Error submitting file:';
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

  const onInvalid: SubmitErrorHandler<TransactionUploadFileForm> = () => {
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
          <ModalHeader>File Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.fileUpload}>
              <FormLabel htmlFor="fileUpload">Upload File</FormLabel>
              <Input
                id="fileUpload"
                type="file"
                {...register('fileUpload')}
                accept=".csv,.txt"
                onChange={handleFileChange} // Detect file change
              />
              <FormErrorMessage>
                {errors.fileUpload && errors.fileUpload.message}
              </FormErrorMessage>
            </FormControl>

            {isSubmitting && <p>Uploading...</p>}
            {!isSubmitting && uploadScreenPhase.processPhase && (
              <h4>Parsed Result</h4>
            )}
            {!isSubmitting && uploadScreenPhase.endPhase && (
              <h4>Processed Result</h4>
            )}

            {uploadScreenPhase.transactionUploadFileResponseDTO.items.length >
              0 && (
              <TableContainer>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Success</Th>
                      <Th isNumeric>File Line</Th>
                      <Th>Date</Th>
                      <Th>Description</Th>
                      <Th isNumeric>Amount</Th>
                      <Th>ErrorMessage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {uploadScreenPhase.transactionUploadFileResponseDTO.items.map(
                      (
                        csvProcessedLine: TransactionUploadFileResponseItemDTO
                      ) => (
                        <Tr
                          key={csvProcessedLine.lineNumber}
                          _hover={{
                            background:
                              colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'whiteAlpha.100',
                          }}
                          backgroundColor={
                            csvProcessedLine.error ? 'red.200' : 'green.200'
                          }
                        >
                          <Td>
                            {csvProcessedLine.error ? 'Error' : 'Success'}
                          </Td>
                          <Td>{csvProcessedLine.lineNumber}</Td>
                          <Td>
                            {csvProcessedLine?.csvParsedData?.transactionDate &&
                              new Date(
                                csvProcessedLine?.csvParsedData?.transactionDate
                              ).toLocaleDateString()}
                          </Td>
                          <Td>
                            {csvProcessedLine?.csvParsedData?.description}
                          </Td>
                          <Td isNumeric>
                            {csvProcessedLine?.csvParsedData?.amount}
                          </Td>
                          <Td>{csvProcessedLine.errorMessage}</Td>
                        </Tr>
                      )
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              type="submit"
              isLoading={isSubmitting}
              disabled={uploadScreenPhase.endPhase}
              visibility={uploadScreenPhase.endPhase ? 'hidden' : 'visible'}
            >
              {uploadScreenPhase.parsePhase ? 'Parse' : 'Process'}
            </Button>
            <Button onClick={onClose}>
              {uploadScreenPhase.endPhase ? 'Close' : 'Cancel'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default TransactionUploadFile;
