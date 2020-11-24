import Transaction from '../models/Transaction';
import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse'
import Category from '../models/Category';

interface Request {
  filename: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome',
  value: number,
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const filePath = path.join(uploadConfig.directory, filename);

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [ title, type, value, category ] = line;
      if (!title || !type || !value) return;

      categories.push(category)
      transactions.push({
        title,
        type,
        value,
        category
      })
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categories)
      }
    });

    const existentCategoriesTitle = existentCategories.map((category: Category) => category.title);

    const addCategoriesTitle = categories
      .filter((category: string) => !existentCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoriesTitle.map((title: string) => ({
        title
      }))
    );

    await categoryRepository.save(newCategories);

    const allCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(({title, value, type, category}) => ({
        title,
        value,
        type,
        category: allCategories.find(c => c.title === category)
      }))
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
