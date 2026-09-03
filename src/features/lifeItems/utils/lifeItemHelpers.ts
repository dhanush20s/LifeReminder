import React from 'react';
import { LifeItemStatus, LifeItemType } from '../../../types/lifeItem';
import { colors } from '../../../theme';
import { format, parseISO, differenceInDays, formatDistanceToNow } from 'date-fns';

export const getLifeItemTypeLabel = (type: LifeItemType): string => {
  switch (type) {
    case 'reminder': return 'Reminder';
    case 'task': return 'Task';
    case 'event': return 'Event';
    case 'follow_up': return 'Follow-up';
    case 'bill': return 'Bill';
    case 'subscription': return 'Subscription';
    case 'expense': return 'Expense';
    case 'inventory': return 'Inventory Item';
    case 'expiry': return 'Expiry Tracking';
    case 'borrow': return 'Borrow / Lend';
    case 'checklist': return 'Checklist';
    case 'parking': return 'Parking Spot';
    case 'note': return 'Note';
    case 'counter': return 'Counter';
    default: return 'Life Item';
  }
};

export const getStatusColor = (status: LifeItemStatus): string => {
  switch (status) {
    case 'completed': return colors.success;
    case 'overdue': return colors.danger;
    case 'pending': return colors.info;
    case 'cancelled': return colors.textMuted;
    case 'archived': return colors.textMuted;
    default: return colors.textSecondary;
  }
};

export const getPriorityColor = (priority?: 'low' | 'normal' | 'high'): string => {
  switch (priority) {
    case 'high': return colors.danger;
    case 'normal': return colors.info;
    case 'low': return colors.success;
    default: return colors.textMuted;
  }
};

export const formatLifeItemDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
  } catch (err) {
    return dateStr;
  }
};

export const formatLifeItemDateTime = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy · h:mm a');
  } catch (err) {
    return dateStr;
  }
};

export const getRelativeDueText = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const target = parseISO(dateStr);
    return formatDistanceToNow(target, { addSuffix: true });
  } catch (err) {
    return '';
  }
};

export const getDaysRemaining = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  try {
    const target = parseISO(dateStr);
    return differenceInDays(target, new Date());
  } catch (err) {
    return null;
  }
};
