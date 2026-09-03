import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LifeItem, LifeItemStatus, InboxItem, AttentionItem } from '../../types/lifeItem';
import { lifeItemRepository } from '../../database/repositories/lifeItemRepository';
import { inboxRepository } from '../../database/repositories/inboxRepository';
import { attentionService } from '../../services/attentionService';

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
    await lifeItemRepository.updateStatus(id, status);
    dispatch(fetchAllLifeItems());
  }
);

export const updateLifeItem = createAsyncThunk(
  'lifeItems/update',
  async ({ id, changes }: { id: string; changes: Partial<LifeItem> }, { dispatch }) => {
    await lifeItemRepository.update(id, changes);
    dispatch(fetchAllLifeItems());
  }
);

export const archiveLifeItem = createAsyncThunk(
  'lifeItems/archive',
  async (id: string, { dispatch }) => {
    await lifeItemRepository.archive(id);
    dispatch(fetchAllLifeItems());
  }
);

export const deleteLifeItem = createAsyncThunk('lifeItems/delete', async (id: string, { dispatch }) => {
  await lifeItemRepository.delete(id);
  dispatch(fetchAllLifeItems());
});

export const addBrainDump = createAsyncThunk('lifeItems/addBrainDump', async (content: string, { dispatch }) => {
  const item = await inboxRepository.create(content);
  dispatch(fetchAllLifeItems());
  return item;
});

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
