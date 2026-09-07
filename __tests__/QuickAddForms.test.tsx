import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ReminderFormSheet } from '../src/features/quickAdd/components/ReminderFormSheet';
import { ExpenseFormSheet } from '../src/features/quickAdd/components/ExpenseFormSheet';
import { BillFormSheet } from '../src/features/quickAdd/components/BillFormSheet';
import { ChecklistFormSheet } from '../src/features/quickAdd/components/ChecklistFormSheet';
import { ExpiryFormSheet } from '../src/features/quickAdd/components/ExpiryFormSheet';
import { BorrowFormSheet } from '../src/features/quickAdd/components/BorrowFormSheet';
import { InventoryFormSheet } from '../src/features/quickAdd/components/InventoryFormSheet';
import { ParkingFormSheet } from '../src/features/quickAdd/components/ParkingFormSheet';
import { NoteFormSheet } from '../src/features/quickAdd/components/NoteFormSheet';

jest.mock('../src/database/repositories/expenseRepository', () => ({
  expenseRepository: {
    getCategories: jest.fn().mockResolvedValue([
      { id: 'cat_food', name: 'Food & Dining', icon: 'Utensils', color: '#EF4444' },
    ]),
  },
}));

describe('Quick Add Form Sheets Component Rendering', () => {
  it('renders ReminderFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<ReminderFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders ExpenseFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<ExpenseFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders BillFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<BillFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders ChecklistFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<ChecklistFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders ExpiryFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<ExpiryFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders BorrowFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<BorrowFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders InventoryFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<InventoryFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders ParkingFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<ParkingFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders NoteFormSheet cleanly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<NoteFormSheet visible={true} onClose={jest.fn()} onSubmit={jest.fn()} />).toJSON();
    });
    expect(tree).toBeDefined();
  });
});
