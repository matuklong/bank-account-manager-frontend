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

export type InvestmentItem = {
  name: string;
  value: number;
};

export class MatchedInvestmentAccount {
  account: Account;

  investment?: InvestmentItem;

  investmentValue?: number;

  investmentPercentage?: number;

  constructor(account: Account, investment?: InvestmentItem) {
    this.account = account;

    if (investment) {
      this.investment = investment;

      // Ensure investment.value and account.balance are defined before performing arithmetic
      if (
        typeof investment.value === 'number' &&
        typeof account.balance === 'number'
      ) {
        this.investmentValue = investment.value - account.balance;

        // Ensure account.balance is not zero before calculating percentage
        if (account.balance !== 0) {
          this.investmentPercentage =
            (this.investmentValue / account.balance) * 100;
        }
      }
    }
  }
}
