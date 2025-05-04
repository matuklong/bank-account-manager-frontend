'use client';

import Fuse from 'fuse.js';

import { MatchedInvestmentAccount } from '~/lib/types';
import type { Account, InvestmentItem } from '~/lib/types';

// number validation values
const locale = typeof navigator !== 'undefined' ? navigator.language : 'pt-BR'; // Fallback to 'pt-BR' if navigator is not available
const formatter = new Intl.NumberFormat(locale);
const parts = formatter.formatToParts(12345.67); // Example number to detect separators

export const parseStringCurrency = (value: string): number | null => {
  const decimalSeparator =
    parts.find((part) => part.type === 'decimal')?.value || '.';
  const groupSeparator =
    parts.find((part) => part.type === 'group')?.value || ',';

  // Remove invalid characters (letters, extra symbols)
  const sanitizedValue = value.replace(/[^0-9.,-]/g, '');

  // Replace group separator and normalize decimal separator
  const normalizedValue = sanitizedValue
    .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
    .replace(decimalSeparator, '.');

  // Parse the normalized value into a number
  const parsedValue = parseFloat(normalizedValue);

  // Return the parsed value as a string or null if invalid
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

export const parseInvestmentData = (text: string): InvestmentItem[] => {
  const investments: InvestmentItem[] = [];

  // Itaú Dunamis Fundo de Ações	R$ 1.315,20
  // 4,08%	R$ 22.670,37
  // 4,94%	R$ 33.833,54
  // 6,95%	R$ 17.102,45
  // 2,04%	R$ 48.183,95
  // 7,63%	R$ 12.759,37
  // 39,66%	1.456.151,66	resgatar	aplicar
  const regExpComponent =
    /^([\wáàãâêéíïóôõúç ]+)\tR\$ [0-9.,]+\n.*\n.*\n.*\n.*\n.*\n.*\t([0-9.,]+)\tresgatar\taplicar.*$/gm;
  // CDB-DI
  // -
  // Nenhum valor
  // -
  // Nenhum valor
  // -
  // Nenhum valor
  // -
  // Nenhum valor
  // -
  // Nenhum valor	15.420,09	resgatar	aplicar
  const regExpComponent2 =
    /^([\wáàãâêéíïóôõúç\- ]+)\t\n-\nNenhum valor\t\n-\nNenhum valor\t\n-\nNenhum valor\t\n-\nNenhum valor\t\n-\nNenhum valor\t([0-9.,]+)\tresgatar\taplicar.*$/gm;

  // Helper function to process matches
  const processMatch = (
    firstMatch: RegExpExecArray | null,
    regExp: RegExp
  ): void => {
    let match = firstMatch;
    while (match) {
      if (match.length === 3) {
        const name = match[1].trim();
        const value = parseStringCurrency(match[2].trim());
        if (value) investments.push({ name, value });
      }

      if (investments.length > 10) break; // Stop if too many investments are found
      match = regExp.exec(text); // Get the next match
    }
  };

  // Process matches for both regular expressions
  processMatch(regExpComponent.exec(text), regExpComponent);
  processMatch(regExpComponent2.exec(text), regExpComponent2);

  return investments;
};

export const matchInvestmentsToAccounts = (
  investments: InvestmentItem[],
  accounts: Account[]
): MatchedInvestmentAccount[] => {
  const fuse = new Fuse(investments, {
    keys: ['name'], // Search by account description
    threshold: 0.4, // Adjust the threshold for fuzzy matching
  });

  const matchedList: MatchedInvestmentAccount[] = [];

  accounts.forEach((account) => {
    const result = fuse.search(account.description);

    if (result.length > 0) {
      const bestMatch = result[0].item; // Get the best matching account

      matchedList.push(new MatchedInvestmentAccount(account, bestMatch));
    } else {
      matchedList.push(new MatchedInvestmentAccount(account));
    }
  });

  return matchedList;
};
