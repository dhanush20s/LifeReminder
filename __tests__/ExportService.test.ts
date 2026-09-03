import { exportService } from '../src/services/exportService';
import { Expense } from '../src/types/lifeItem';

describe('ExportService Unit Tests', () => {
  it('should format minor integer currency units into standard INR strings', () => {
    expect(exportService.formatAmount(35050)).toBe('₹350.50');
    expect(exportService.formatAmount(124000)).toBe('₹1240.00');
    expect(exportService.formatAmount(0)).toBe('₹0.00');
  });

  it('should generate valid CSV header and rows', () => {
    const mockExpenses: Expense[] = [
      {
        id: 'exp1',
        amountMinor: 35000,
        categoryId: 'cat_food',
        categoryName: 'Food',
        description: 'Lunch',
        expenseDate: '2026-09-02',
        createdAt: '2026-09-02T12:00:00Z',
        updatedAt: '2026-09-02T12:00:00Z',
      },
    ];

    const csv = exportService.generateCSV(mockExpenses);
    expect(csv).toContain('Date,Category,Description,Payment Method,Amount');
    expect(csv).toContain('2026-09-02,"Food","Lunch","",350.00');
  });
});
