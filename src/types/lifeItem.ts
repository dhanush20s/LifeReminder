export type LifeItemType =
  | 'reminder'
  | 'task'
  | 'event'
  | 'follow_up'
  | 'bill'
  | 'subscription'
  | 'expense'
  | 'inventory'
  | 'expiry'
  | 'borrow'
  | 'checklist'
  | 'parking'
  | 'note'
  | 'counter';

export type LifeItemStatus =
  | 'pending'
  | 'completed'
  | 'overdue'
  | 'cancelled'
  | 'archived';

export type LifeItemPriority = 'low' | 'normal' | 'high';

export interface LifeItem {
  id: string;
  type: LifeItemType;
  title: string;
  description?: string;
  categoryId?: string;
  status: LifeItemStatus;
  priority?: LifeItemPriority;
  startAt?: string; // ISO date string
  endAt?: string;   // ISO date string
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface RecurrenceRule {
  id: string;
  lifeItemId?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  byWeekday?: string; // e.g. "MON,WED,FRI"
  byMonthDay?: number; // e.g. 15
  startDate: string;
  endDate?: string;
  timezone: string;
}

export interface Reminder {
  id: string;
  lifeItemId: string;
  reminderAt: string; // ISO date time string
  reminderOffsetMinutes: number;
  repeatRuleId?: string;
  isEnabled: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  amountMinor: number; // Stored as minor integer units (paise/cents)
  categoryId: string;
  categoryName?: string;
  description?: string;
  expenseDate: string; // ISO date YYYY-MM-DD
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  lifeItemId: string;
  amountMinor: number;
  dueDate: string; // YYYY-MM-DD
  repeatRuleId?: string;
  status: LifeItemStatus;
  title?: string;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  position: number;
  isCompleted: boolean;
}

export interface Checklist {
  id: string;
  lifeItemId: string;
  title: string;
  scheduleRuleId?: string;
  alarmEnabled: boolean;
  alarmTime?: string; // HH:mm
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpiryRecord {
  id: string;
  lifeItemId: string;
  title: string;
  expiryType: 'food' | 'medicine' | 'warranty' | 'document' | 'membership' | 'insurance' | 'renewal' | 'service';
  expiryDate: string; // YYYY-MM-DD
  warningDays: number;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface BorrowRecord {
  id: string;
  lifeItemId: string;
  direction: 'lent' | 'borrowed';
  personName: string;
  itemName?: string;
  amountMinor?: number;
  borrowedAt: string;
  expectedReturnAt?: string;
  returnedAt?: string;
  status: 'pending' | 'due_soon' | 'overdue' | 'returned' | 'cancelled';
  notes?: string;
}

export interface InboxItem {
  id: string;
  content: string;
  createdAt: string;
  processedAt?: string;
  convertedType?: LifeItemType;
  convertedId?: string;
}

export interface AttentionItem {
  lifeItemId: string;
  type: LifeItemType;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  dateStr?: string;
}
