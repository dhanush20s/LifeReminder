import { Expense } from '../types/lifeItem';
import Share from 'react-native-share';

export const exportService = {
  formatAmount(minorUnits: number): string {
    return `₹${(minorUnits / 100).toFixed(2)}`;
  },

  generateCSV(expenses: Expense[]): string {
    const headers = ['Date', 'Category', 'Description', 'Payment Method', 'Amount'];
    const rows = expenses.map((exp) => [
      exp.expenseDate,
      `"${exp.categoryName || 'General'}"`,
      `"${exp.description || ''}"`,
      `"${exp.paymentMethod || ''}"`,
      (exp.amountMinor / 100).toFixed(2),
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  generatePlainText(expenses: Expense[], totalIncomeMinor: number = 0): string {
    const totalExpenseMinor = expenses.reduce((acc, curr) => acc + curr.amountMinor, 0);
    const balanceMinor = totalIncomeMinor - totalExpenseMinor;

    let text = `LIFE REMINDER — EXPENSE SUMMARY\n`;
    text += `Income: ${this.formatAmount(totalIncomeMinor)}\n`;
    text += `Expenses: ${this.formatAmount(totalExpenseMinor)}\n`;
    text += `Balance: ${this.formatAmount(balanceMinor)}\n\n`;
    text += `Date | Category | Description | Amount\n`;
    text += `----------------------------------------\n`;

    expenses.forEach((exp) => {
      text += `${exp.expenseDate} | ${exp.categoryName || 'General'} | ${exp.description || '-'} | ${this.formatAmount(exp.amountMinor)}\n`;
    });

    return text;
  },

  async shareReport(title: string, message: string): Promise<void> {
    try {
      await Share.open({
        title,
        message,
        type: 'text/plain',
      });
    } catch (err) {
      // User cancelled share dialog
      console.log('Share dismissed:', err);
    }
  },
};
