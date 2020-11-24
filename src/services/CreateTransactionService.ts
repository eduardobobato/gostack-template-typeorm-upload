import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total)
      throw new AppError('Insuficient founds', 400);

    const categoryMatched = await this.findOrCreateCategory(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryMatched.id
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
  private async findOrCreateCategory(category: string): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const categoryMatched = await categoryRepository.findOne({
      where: {
        title: category
      }
    });

    if (!categoryMatched) {
      const newCategory = categoryRepository.create({
        title: category
      })
      await categoryRepository.save(newCategory);
      return newCategory;
    }
    return categoryMatched;
  }
}

export default CreateTransactionService;
