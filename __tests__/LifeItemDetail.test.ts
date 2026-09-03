import { 
  getLifeItemTypeLabel, 
  getStatusColor, 
  getPriorityColor, 
  formatLifeItemDate, 
  getDaysRemaining 
} from '../src/features/lifeItems/utils/lifeItemHelpers';
import { colors } from '../src/theme';

describe('lifeItemHelpers Unit Tests', () => {
  it('should map LifeItemType to clean readable labels', () => {
    expect(getLifeItemTypeLabel('reminder')).toBe('Reminder');
    expect(getLifeItemTypeLabel('bill')).toBe('Bill');
    expect(getLifeItemTypeLabel('expiry')).toBe('Expiry Tracking');
    expect(getLifeItemTypeLabel('borrow')).toBe('Borrow / Lend');
    expect(getLifeItemTypeLabel('checklist')).toBe('Checklist');
    expect(getLifeItemTypeLabel('task')).toBe('Task');
  });

  it('should return correct theme status colors', () => {
    expect(getStatusColor('completed')).toBe(colors.success);
    expect(getStatusColor('overdue')).toBe(colors.danger);
    expect(getStatusColor('pending')).toBe(colors.info);
  });

  it('should return correct priority colors', () => {
    expect(getPriorityColor('high')).toBe(colors.danger);
    expect(getPriorityColor('normal')).toBe(colors.info);
    expect(getPriorityColor('low')).toBe(colors.success);
  });

  it('should calculate days remaining accurately', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = futureDate.toISOString();
    const daysLeft = getDaysRemaining(dateStr);
    expect(daysLeft).toBeGreaterThanOrEqual(9);
    expect(daysLeft).toBeLessThanOrEqual(11);
  });
});
