import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { quickAddRepository, QuickAddShortcutItem, DEFAULT_SHORTCUTS } from '../../database/repositories/quickAddRepository';

interface QuickAddState {
  activeShortcuts: QuickAddShortcutItem[];
  availableShortcuts: QuickAddShortcutItem[];
  isLoading: boolean;
}

const initialState: QuickAddState = {
  activeShortcuts: DEFAULT_SHORTCUTS.filter((s) => s.isActive),
  availableShortcuts: DEFAULT_SHORTCUTS.filter((s) => !s.isActive),
  isLoading: false,
};

export const fetchShortcuts = createAsyncThunk(
  'quickAdd/fetchShortcuts',
  async () => {
    const [active, available] = await Promise.all([
      quickAddRepository.getActiveShortcuts(),
      quickAddRepository.getAvailableShortcuts(),
    ]);
    return { active, available };
  }
);

export const persistShortcutsOrder = createAsyncThunk(
  'quickAdd/persistShortcutsOrder',
  async ({
    active,
    available,
  }: {
    active: QuickAddShortcutItem[];
    available: QuickAddShortcutItem[];
  }) => {
    await quickAddRepository.saveShortcutsOrder(active, available);
    return { active, available };
  }
);

const quickAddSlice = createSlice({
  name: 'quickAdd',
  initialState,
  reducers: {
    setActiveShortcuts(state, action: PayloadAction<QuickAddShortcutItem[]>) {
      state.activeShortcuts = action.payload;
    },
    removeShortcut(state, action: PayloadAction<string>) {
      const targetId = action.payload;
      const itemToRemove = state.activeShortcuts.find((s) => s.id === targetId);
      if (itemToRemove) {
        state.activeShortcuts = state.activeShortcuts.filter((s) => s.id !== targetId);
        state.availableShortcuts.push({ ...itemToRemove, isActive: false });
      }
    },
    addShortcut(state, action: PayloadAction<QuickAddShortcutItem>) {
      const itemToAdd = action.payload;
      state.availableShortcuts = state.availableShortcuts.filter((s) => s.id !== itemToAdd.id);
      state.activeShortcuts.push({ ...itemToAdd, isActive: true });
    },
    reorderShortcuts(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex >= 0 &&
        fromIndex < state.activeShortcuts.length &&
        toIndex >= 0 &&
        toIndex < state.activeShortcuts.length
      ) {
        const updated = [...state.activeShortcuts];
        const [movedItem] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedItem);
        state.activeShortcuts = updated;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShortcuts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchShortcuts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeShortcuts = action.payload.active;
        state.availableShortcuts = action.payload.available;
      })
      .addCase(persistShortcutsOrder.fulfilled, (state, action) => {
        state.activeShortcuts = action.payload.active;
        state.availableShortcuts = action.payload.available;
      });
  },
});

export const {
  setActiveShortcuts,
  removeShortcut,
  addShortcut,
  reorderShortcuts,
} = quickAddSlice.actions;

export default quickAddSlice.reducer;
