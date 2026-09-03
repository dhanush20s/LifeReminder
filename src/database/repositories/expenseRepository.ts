import { getDB } from '../connection';
import { Expense, ExpenseCategory } from '../../types/lifeItem';
import { v4 as uuidv4 } from 'uuid';

export const expenseRepository = {
  async create(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const db = await getDB();
    const id = uuidv4();
    const now = new Date().toISOString();

    const newExpense: Expense = {
      ...expense,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.executeSql(
      `INSERT INTO expenses (id, amount_minor, category_id, description, expense_date, payment_method, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newExpense.id,
        newExpense.amountMinor,
        newExpense.categoryId,
        newExpense.description || null,
        newExpense.expenseDate,
        newExpense.paymentMethod || null,
        newExpense.notes || null,
        newExpense.createdAt,
        newExpense.updatedAt,
      ]
    );

    return newExpense;
  },

  async findAll(): Promise<Expense[]> {
    const db = await getDB();
    const [results] = await db.executeSql(
      `SELECT e.*, c.name as category_name 
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       ORDER BY e.expense_date DESC, e.created_at DESC;`
    );
    const expenses: Expense[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      expenses.push({
        id: row.id,
        amountMinor: row.amount_minor,
        categoryId: row.category_id,
        categoryName: row.category_name || 'General',
        description: row.description,
        expenseDate: row.expense_date,
        paymentMethod: row.payment_method,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }
    return expenses;
  },

  async getCategories(): Promise<ExpenseCategory[]> {
    const db = await getDB();
    const [results] = await db.executeSql('SELECT * FROM expense_categories;');
    const categories: ExpenseCategory[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      categories.push({
        id: row.id,
        name: row.name,
        icon: row.icon,
        isDefault: Boolean(row.is_default),
      });
    }
    return categories;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.executeSql('DELETE FROM expenses WHERE id = ?;', [id]);
  },
};
