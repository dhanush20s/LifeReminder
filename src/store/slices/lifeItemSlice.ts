import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LifeItem, LifeItemStatus, InboxItem, AttentionItem } from '../../types/lifeItem';
import { lifeItemRepository } from '../../database/repositories/lifeItemRepository';
import { inboxRepository } from '../../database/repositories/inboxRepository';
import { attentionService } from '../../services/attentionService';

import { reminderService } from '../../services/reminderService';

interface LifeItemState {
  items: LifeItem[];
  inbox: InboxItem[];
  needsAttention: AttentionItem[];
  loading: boolean;
  searchQuery: string;
  searchResults: LifeItem[];
}

const initialState: LifeItemState = {
  items: [],
  inbox: [],
  needsAttention: [],
  loading: false,
  searchQuery: '',
  searchResults: [],
};

export const fetchAllLifeItems = createAsyncThunk('lifeItems/fetchAll', async () => {
  const items = await lifeItemRepository.findAll();
  const inbox = await inboxRepository.findUnprocessed();
  const needsAttention = attentionService.calculateNeedsAttention(items);
  return { items, inbox, needsAttention };
});

export const createLifeItem = createAsyncThunk(
  'lifeItems/create',
  async (item: Omit<LifeItem, 'id' | 'createdAt' | 'updatedAt'>, { dispatch }) => {
    const created = await lifeItemRepository.create(item);
    dispatch(fetchAllLifeItems());
    return created;
  }
);

export const updateLifeItemStatus = createAsyncThunk(
  'lifeItems/updateStatus',
  async ({ id, status }: { id: string; status: LifeItemStatus }, { dispatch }) => {
    if (status === 'completed') {
      await reminderService.completeReminder(id);
    } else {
      await lifeItemRepository.updateStatus(id, status);
    }
    dispatch(fetchAllLifeItems());
  }
);

export const updateLifeItem = createAsyncThunk(
  'lifeItems/update',
  async ({ id, changes }: { id: string; changes: Partial<LifeItem> }, { dispatch }) => {
    const existing = await lifeItemRepository.findById(id);
    if (existing && existing.type === 'reminder') {
      await reminderService.updateReminder(id, {
        title: changes.title,
        description: changes.description,
        startAt: changes.startAt,
        priority: changes.priority,
        categoryId: changes.categoryId,
      });
    } else {
      await lifeItemRepository.update(id, changes);
    }
    dispatch(fetchAllLifeItems());
  }
);

export const snoozeReminder = createAsyncThunk(
  'lifeItems/snoozeReminder',
  async ({ id, snoozeMinutes }: { id: string; snoozeMinutes: number }, { dispatch }) => {
    const newTime = await reminderService.snoozeReminder(id, snoozeMinutes);
    dispatch(fetchAllLifeItems());
    return newTime.toISOString();
  }
);

export const archiveLifeItem = createAsyncThunk(
  'lifeItems/archive',
  async (id: string, { dispatch }) => {
    await reminderService.archiveReminder(id);
    dispatch(fetchAllLifeItems());
  }
);

export const deleteLifeItem = createAsyncThunk('lifeItems/delete', async (id: string, { dispatch }) => {
  await reminderService.deleteReminder(id);
  dispatch(fetchAllLifeItems());
});

export const addBrainDump = createAsyncThunk('lifeItems/addBrainDump', async (content: string, { dispatch }) => {
  const item = await inboxRepository.create(content);
  dispatch(fetchAllLifeItems());
  return item;
});

export const createQuickAddReminder = createAsyncThunk(
  'lifeItems/createQuickAddReminder',
  async (
    payload: {
      title: string;
      description?: string;
      startAt: string;
      priority?: 'low' | 'normal' | 'high';
      repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
      offsetMinutes?: number;
    },
    { dispatch }
  ) => {
    const result = await reminderService.createReminder(payload);
    dispatch(fetchAllLifeItems());
    return result.lifeItem;
  }
);

export const createQuickAddBill = createAsyncThunk(
  'lifeItems/createQuickAddBill',
  async (
    payload: {
      title: string;
      amountMinor: number;
      dueDate: string;
      description?: string;
      repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    },
    { dispatch }
  ) => {
    const created = await lifeItemRepository.createBillComposite(
      {
        type: 'bill',
        title: payload.title,
        description: payload.description,
        status: 'pending',
        startAt: payload.dueDate,
      },
      payload.amountMinor,
      payload.dueDate,
      payload.repeatFrequency
    );
    dispatch(fetchAllLifeItems());
    return created;
  }
);

export const createQuickAddChecklist = createAsyncThunk(
  'lifeItems/createQuickAddChecklist',
  async (
    payload: {
      title: string;
      itemsList: string[];
      alarmTime?: string;
      startAt?: string;
    },
    { dispatch }
  ) => {
    const created = await lifeItemRepository.createChecklistComposite(
      payload.title,
      payload.itemsList,
      payload.alarmTime,
      payload.startAt
    );
    dispatch(fetchAllLifeItems());
    return created;
  }
);

export const createQuickAddExpiry = createAsyncThunk(
  'lifeItems/createQuickAddExpiry',
  async (
    payload: {
      title: string;
      expiryDate: string;
      expiryType: 'food' | 'medicine' | 'warranty' | 'document' | 'membership' | 'insurance' | 'renewal' | 'service';
      warningDays?: number;
    },
    { dispatch }
  ) => {
    const created = await lifeItemRepository.createExpiryComposite(
      payload.title,
      payload.expiryDate,
      payload.expiryType,
      payload.warningDays || 7
    );
    dispatch(fetchAllLifeItems());
    return created;
  }
);

export const createQuickAddBorrow = createAsyncThunk(
  'lifeItems/createQuickAddBorrow',
  async (
    payload: {
      direction: 'lent' | 'borrowed';
      personName: string;
      itemName?: string;
      amountMinor?: number;
      expectedReturnAt?: string;
      notes?: string;
    },
    { dispatch }
  ) => {
    const created = await lifeItemRepository.createBorrowComposite(
      payload.direction,
      payload.personName,
      payload.itemName,
      payload.amountMinor,
      payload.expectedReturnAt,
      payload.notes
    );
    dispatch(fetchAllLifeItems());
    return created;
  }
);

export const createQuickAddInventory = createAsyncThunk(
  'lifeItems/createQuickAddInventory',
  async (
    payload: {
      name: string;
      quantity: number;
      unit?: string;
      location?: string;
      purchaseDate?: string;
      expiryDate?: string;
      notes?: string;
    },
    { dispatch }
  ) => {
    const created = await lifeItemRepository.createInventoryComposite(
      payload.name,
      payload.quantity,
      payload.unit,
      payload.location,
      payload.purchaseDate,
      payload.expiryDate,
      payload.notes
    );
    dispatch(fetchAllLifeItems());
    return created;
  }
);

export const createQuickAddParking = createAsyncThunk(
  'lifeItems/createQuickAddParking',
  async (
    payload: {
      floor?: string;
      slot?: string;
      locationNotes?: string;
    },
    { dispatch }
  ) => {
    const created = await lifeItemRepository.createParkingComposite(
      payload.floor,
      payload.slot,
      payload.locationNotes
    );
    dispatch(fetchAllLifeItems());
    return created;
  }
);

export const searchLifeItems = createAsyncThunk('lifeItems/search', async (query: string) => {
  if (!query.trim()) return [];
  return await lifeItemRepository.search(query);
});

const lifeItemSlice = createSlice({
  name: 'lifeItems',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLifeItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllLifeItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.inbox = action.payload.inbox;
        state.needsAttention = action.payload.needsAttention;
      })
      .addCase(searchLifeItems.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
  },
});

export const { setSearchQuery } = lifeItemSlice.actions;
export default lifeItemSlice.reducer;
