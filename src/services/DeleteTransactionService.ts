import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository } from 'typeorm';

interface Request {
  id: string
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(id);

    if (!transaction)
      throw new AppError('Transaction not found.', 400);

    await transactionsRepository.remove(transaction);

    return;
  }
}

export default DeleteTransactionService;
