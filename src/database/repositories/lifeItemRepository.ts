import { getDB } from '../connection';
import { 
  LifeItem, 
  LifeItemStatus, 
  LifeItemType, 
  Reminder, 
  Bill, 
  Expense, 
  Checklist, 
  ChecklistItem, 
  ExpiryRecord, 
  BorrowRecord 
} from '../../types/lifeItem';
import { v4 as uuidv4 } from 'uuid';

export const lifeItemRepository = {
  async create(item: Omit<LifeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<LifeItem> {
    const db = await getDB();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newItem: LifeItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.executeSql(
      `INSERT INTO life_items (id, type, title, description, category_id, status, priority, start_at, end_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newItem.id,
        newItem.type,
        newItem.title,
        newItem.description || null,
        newItem.categoryId || null,
        newItem.status,
        newItem.priority || 'normal',
        newItem.startAt || null,
        newItem.endAt || null,
        newItem.createdAt,
        newItem.updatedAt,
      ]
    );

    return newItem;
  },

  async findById(id: string): Promise<LifeItem | null> {
    const db = await getDB();
    const [results] = await db.executeSql(
      'SELECT * FROM life_items WHERE id = ?;',
      [id]
    );
    if (results.rows.length === 0) return null;
    const row = results.rows.item(0);
    return {
      id: row.id,
      type: row.type as LifeItemType,
      title: row.title,
      description: row.description,
      categoryId: row.category_id,
      status: row.status as LifeItemStatus,
      priority: row.priority,
      startAt: row.start_at,
      endAt: row.end_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      archivedAt: row.archived_at,
    };
  },

  async findAll(): Promise<LifeItem[]> {
    const db = await getDB();
    const [results] = await db.executeSql(
      'SELECT * FROM life_items WHERE status != "archived" ORDER BY start_at ASC, created_at DESC;'
    );
    const items: LifeItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      items.push({
        id: row.id,
        type: row.type as LifeItemType,
        title: row.title,
        description: row.description,
        categoryId: row.category_id,
        status: row.status as LifeItemStatus,
        priority: row.priority,
        startAt: row.start_at,
        endAt: row.end_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        archivedAt: row.archived_at,
      });
    }
    return items;
  },

  async findByDateRange(startDateISO: string, endDateISO: string): Promise<LifeItem[]> {
    const db = await getDB();
    const [results] = await db.executeSql(
      `SELECT * FROM life_items 
       WHERE start_at >= ? AND start_at <= ? AND status != 'archived'
       ORDER BY start_at ASC;`,
      [startDateISO, endDateISO]
    );
    const items: LifeItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      items.push({
        id: row.id,
        type: row.type as LifeItemType,
        title: row.title,
        description: row.description,
        categoryId: row.category_id,
        status: row.status as LifeItemStatus,
        priority: row.priority,
        startAt: row.start_at,
        endAt: row.end_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        archivedAt: row.archived_at,
      });
    }
    return items;
  },

  async update(id: string, changes: Partial<LifeItem>): Promise<void> {
    const db = await getDB();
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (changes.title !== undefined) {
      fields.push('title = ?');
      values.push(changes.title);
    }
    if (changes.description !== undefined) {
      fields.push('description = ?');
      values.push(changes.description);
    }
    if (changes.status !== undefined) {
      fields.push('status = ?');
      values.push(changes.status);
    }
    if (changes.priority !== undefined) {
      fields.push('priority = ?');
      values.push(changes.priority);
    }
    if (changes.startAt !== undefined) {
      fields.push('start_at = ?');
      values.push(changes.startAt);
    }
    if (changes.endAt !== undefined) {
      fields.push('end_at = ?');
      values.push(changes.endAt);
    }

    values.push(id);
    await db.executeSql(`UPDATE life_items SET ${fields.join(', ')} WHERE id = ?;`, values);
  },

  async updateStatus(id: string, status: LifeItemStatus): Promise<void> {
    const db = await getDB();
    const now = new Date().toISOString();
    await db.executeSql(
      'UPDATE life_items SET status = ?, updated_at = ? WHERE id = ?;',
      [status, now, id]
    );
  },

  async archive(id: string): Promise<void> {
    const db = await getDB();
    const now = new Date().toISOString();
    await db.executeSql(
      'UPDATE life_items SET status = "archived", archived_at = ?, updated_at = ? WHERE id = ?;',
      [now, now, id]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.executeSql('DELETE FROM life_items WHERE id = ?;', [id]);
  },

  async search(query: string): Promise<LifeItem[]> {
    const db = await getDB();
    const term = `%${query}%`;
    const [results] = await db.executeSql(
      `SELECT * FROM life_items 
       WHERE (title LIKE ? OR description LIKE ?) AND status != 'archived'
       ORDER BY created_at DESC;`,
      [term, term]
    );
    const items: LifeItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      items.push({
        id: row.id,
        type: row.type as LifeItemType,
        title: row.title,
        description: row.description,
        categoryId: row.category_id,
        status: row.status as LifeItemStatus,
        priority: row.priority,
        startAt: row.start_at,
        endAt: row.end_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        archivedAt: row.archived_at,
      });
    }
    return items;
  },

  // Type-Specific SQLite detail retrieval
  async findDetailsById(id: string, type: LifeItemType): Promise<any> {
    const db = await getDB();
    switch (type) {
      case 'reminder': {
        const [res] = await db.executeSql('SELECT * FROM reminders WHERE life_item_id = ?;', [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows.item(0);
        return {
          id: row.id,
          lifeItemId: row.life_item_id,
          reminderAt: row.reminder_at,
          reminderOffsetMinutes: row.reminder_offset_minutes,
          repeatRuleId: row.repeat_rule_id,
          isEnabled: Boolean(row.is_enabled),
        } as Reminder;
      }
      case 'bill':
      case 'subscription': {
        const [res] = await db.executeSql('SELECT * FROM bills WHERE life_item_id = ?;', [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows.item(0);
        return {
          id: row.id,
          lifeItemId: row.life_item_id,
          amountMinor: row.amount_minor,
          dueDate: row.due_date,
          repeatRuleId: row.repeat_rule_id,
          status: row.status as LifeItemStatus,
        } as Bill;
      }
      case 'expense': {
        const [res] = await db.executeSql(
          `SELECT e.*, c.name as category_name 
           FROM expenses e
           LEFT JOIN expense_categories c ON e.category_id = c.id
           WHERE e.id = ? OR e.description LIKE ?;`,
          [id, `%${id}%`]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows.item(0);
        return {
          id: row.id,
          amountMinor: row.amount_minor,
          categoryId: row.category_id,
          categoryName: row.category_name || 'General',
          description: row.description,
          expenseDate: row.expense_date,
          paymentMethod: row.payment_method,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        } as Expense;
      }
      case 'checklist': {
        const [res] = await db.executeSql('SELECT * FROM checklists WHERE life_item_id = ?;', [id]);
        let checklistData: Partial<Checklist> = {
          items: [],
          alarmEnabled: false,
        };

        let checklistId = id;
        if (res.rows.length > 0) {
          const row = res.rows.item(0);
          checklistId = row.id;
          checklistData = {
            id: row.id,
            lifeItemId: row.life_item_id,
            scheduleRuleId: row.schedule_rule_id,
            alarmEnabled: Boolean(row.alarm_enabled),
            alarmTime: row.alarm_time,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            items: [],
          };
        }

        const [itemRes] = await db.executeSql(
          'SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY position ASC;',
          [checklistId]
        );
        const checklistItems: ChecklistItem[] = [];
        for (let i = 0; i < itemRes.rows.length; i++) {
          const r = itemRes.rows.item(i);
          checklistItems.push({
            id: r.id,
            checklistId: r.checklist_id,
            title: r.title,
            position: r.position,
            isCompleted: Boolean(r.is_completed),
          });
        }

        return {
          ...checklistData,
          items: checklistItems,
        };
      }
      case 'expiry': {
        const [res] = await db.executeSql('SELECT * FROM expiry_records WHERE life_item_id = ?;', [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows.item(0);
        return {
          id: row.id,
          lifeItemId: row.life_item_id,
          expiryType: row.expiry_type,
          expiryDate: row.expiry_date,
          warningDays: row.warning_days,
        } as ExpiryRecord;
      }
      case 'borrow': {
        const [res] = await db.executeSql('SELECT * FROM borrow_records WHERE life_item_id = ?;', [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows.item(0);
        return {
          id: row.id,
          lifeItemId: row.life_item_id,
          direction: row.direction,
          personName: row.person_name,
          itemName: row.item_name,
          amountMinor: row.amount_minor,
          borrowedAt: row.borrowed_at,
          expectedReturnAt: row.expected_return_at,
          returnedAt: row.returned_at,
          status: row.status,
          notes: row.notes,
        } as BorrowRecord;
      }
      default:
        return null;
    }
  },
};
