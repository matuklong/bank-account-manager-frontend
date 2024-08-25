export interface Account {
  id: number;
  accountNumber: string;
  accountHolder: string;
  description: string;
  balance: number;
  createdAt: Date;
  lastTransactionDate?: Date | null;
  isActive: boolean;
}
