import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Expense, ExpenseCategory } from '../../types/lifeItem';
import { expenseRepository } from '../../database/repositories/expenseRepository';

interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  totalIncomeMinor: number;
  loading: boolean;
}

const initialState: ExpenseState = {
  expenses: [],
  categories: [],
  totalIncomeMinor: 5000000, // Default mock income ₹50,000.00
  loading: false,
};

export const fetchExpenses = createAsyncThunk('expenses/fetch', async () => {
  const expenses = await expenseRepository.findAll();
  const categories = await expenseRepository.getCategories();
  return { expenses, categories };
});

export const addExpense = createAsyncThunk(
  'expenses/add',
  async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, { dispatch }) => {
    const created = await expenseRepository.create(expense);
    dispatch(fetchExpenses());
    return created;
  }
);

export const deleteExpense = createAsyncThunk('expenses/delete', async (id: string, { dispatch }) => {
  await expenseRepository.delete(id);
  dispatch(fetchExpenses());
});

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchExpenses.fulfilled, (state, action) => {
      state.expenses = action.payload.expenses;
      state.categories = action.payload.categories;
    });
  },
});

export default expenseSlice.reducer;
