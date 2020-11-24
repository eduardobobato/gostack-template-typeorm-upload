import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = transactions.reduce((acc, obj) => {
      const value = parseFloat(obj.value.toString() || '0');
      if (obj.type === 'income') {
        acc.income += value;
        acc.total += value;
      }
      if (obj.type === 'outcome') {
        acc.outcome += value;
        acc.total -= value;
      }
      return acc;
    },{
      income: 0,
      outcome: 0,
      total: 0
    });

    return balance;
  }
}

export default TransactionsRepository;
