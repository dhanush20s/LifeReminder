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
import { generateUUID as uuidv4 } from '../../utils/uuid';

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
          notificationId: row.notification_id || undefined,
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

  // SQLite Transactional Composite Item Creation
  async createReminderComposite(
    item: Omit<LifeItem, 'id' | 'createdAt' | 'updatedAt'>,
    reminderAt: string,
    repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Promise<LifeItem> {
    const db = await getDB();
    const id = uuidv4();
    const reminderId = uuidv4();
    const now = new Date().toISOString();

    const newItem: LifeItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO life_items (id, type, title, description, category_id, status, priority, start_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newItem.id,
          newItem.type,
          newItem.title,
          newItem.description || null,
          newItem.categoryId || null,
          newItem.status,
          newItem.priority || 'normal',
          newItem.startAt || reminderAt,
          now,
          now,
        ]
      );

      let ruleId: string | null = null;
      if (repeatFrequency) {
        ruleId = uuidv4();
        tx.executeSql(
          `INSERT INTO recurrence_rules (id, life_item_id, frequency, interval, start_date, timezone)
           VALUES (?, ?, ?, 1, ?, 'UTC');`,
          [ruleId, newItem.id, repeatFrequency, reminderAt]
        );
      }

      tx.executeSql(
        `INSERT INTO reminders (id, life_item_id, reminder_at, repeat_rule_id, is_enabled)
         VALUES (?, ?, ?, ?, 1);`,
        [reminderId, newItem.id, reminderAt, ruleId]
      );
    });

    return newItem;
  },

  async createBillComposite(
    item: Omit<LifeItem, 'id' | 'createdAt' | 'updatedAt'>,
    amountMinor: number,
    dueDate: string,
    repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Promise<LifeItem> {
    const db = await getDB();
    const id = uuidv4();
    const billId = uuidv4();
    const now = new Date().toISOString();

    const newItem: LifeItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO life_items (id, type, title, description, category_id, status, priority, start_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newItem.id,
          newItem.type,
          newItem.title,
          newItem.description || null,
          newItem.categoryId || null,
          newItem.status,
          newItem.priority || 'normal',
          dueDate,
          now,
          now,
        ]
      );

      let ruleId: string | null = null;
      if (repeatFrequency) {
        ruleId = uuidv4();
        tx.executeSql(
          `INSERT INTO recurrence_rules (id, life_item_id, frequency, interval, start_date, timezone)
           VALUES (?, ?, ?, 1, ?, 'UTC');`,
          [ruleId, newItem.id, repeatFrequency, dueDate]
        );
      }

      tx.executeSql(
        `INSERT INTO bills (id, life_item_id, amount_minor, due_date, repeat_rule_id, status)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [billId, newItem.id, amountMinor, dueDate, ruleId, newItem.status]
      );
    });

    return newItem;
  },

  async createChecklistComposite(
    title: string,
    itemsList: string[],
    alarmTime?: string,
    startAt?: string
  ): Promise<LifeItem> {
    const db = await getDB();
    const id = uuidv4();
    const checklistId = uuidv4();
    const now = new Date().toISOString();

    const newItem: LifeItem = {
      id,
      type: 'checklist',
      title,
      status: 'pending',
      startAt: startAt || now,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO life_items (id, type, title, status, start_at, created_at, updated_at)
         VALUES (?, 'checklist', ?, 'pending', ?, ?, ?);`,
        [id, title, startAt || now, now, now]
      );

      tx.executeSql(
        `INSERT INTO checklists (id, life_item_id, alarm_enabled, alarm_time, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [checklistId, id, alarmTime ? 1 : 0, alarmTime || null, now, now]
      );

      itemsList.forEach((itemTitle, pos) => {
        if (itemTitle.trim()) {
          tx.executeSql(
            `INSERT INTO checklist_items (id, checklist_id, title, position, is_completed)
             VALUES (?, ?, ?, ?, 0);`,
            [uuidv4(), checklistId, itemTitle.trim(), pos]
          );
        }
      });
    });

    return newItem;
  },

  async createExpiryComposite(
    title: string,
    expiryDate: string,
    expiryType: 'food' | 'medicine' | 'warranty' | 'document' | 'membership' | 'insurance' | 'renewal' | 'service',
    warningDays: number = 7
  ): Promise<LifeItem> {
    const db = await getDB();
    const id = uuidv4();
    const expiryRecordId = uuidv4();
    const now = new Date().toISOString();

    const newItem: LifeItem = {
      id,
      type: 'expiry',
      title,
      status: 'pending',
      startAt: expiryDate,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO life_items (id, type, title, status, start_at, created_at, updated_at)
         VALUES (?, 'expiry', ?, 'pending', ?, ?, ?);`,
        [id, title, expiryDate, now, now]
      );

      tx.executeSql(
        `INSERT INTO expiry_records (id, life_item_id, expiry_type, expiry_date, warning_days)
         VALUES (?, ?, ?, ?, ?);`,
        [expiryRecordId, id, expiryType, expiryDate, warningDays]
      );
    });

    return newItem;
  },

  async createBorrowComposite(
    direction: 'lent' | 'borrowed',
    personName: string,
    itemName?: string,
    amountMinor?: number,
    expectedReturnAt?: string,
    notes?: string
  ): Promise<LifeItem> {
    const db = await getDB();
    const id = uuidv4();
    const borrowRecordId = uuidv4();
    const now = new Date().toISOString();

    const title = direction === 'lent'
      ? `Lent ${itemName || `₹${((amountMinor || 0) / 100).toFixed(0)}`} to ${personName}`
      : `Borrowed ${itemName || `₹${((amountMinor || 0) / 100).toFixed(0)}`} from ${personName}`;

    const newItem: LifeItem = {
      id,
      type: 'borrow',
      title,
      description: notes,
      status: 'pending',
      startAt: expectedReturnAt || now,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO life_items (id, type, title, description, status, start_at, created_at, updated_at)
         VALUES (?, 'borrow', ?, ?, 'pending', ?, ?, ?);`,
        [id, title, notes || null, expectedReturnAt || now, now, now]
      );

      tx.executeSql(
        `INSERT INTO borrow_records (id, life_item_id, direction, person_name, item_name, amount_minor, borrowed_at, expected_return_at, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?);`,
        [
          borrowRecordId,
          id,
          direction,
          personName,
          itemName || null,
          amountMinor || null,
          now,
          expectedReturnAt || null,
          notes || null,
        ]
      );
    });

    return newItem;
  },

  async createInventoryComposite(
    name: string,
    quantity: number,
    unit?: string,
    location?: string,
    purchaseDate?: string,
    expiryDate?: string,
    notes?: string
  ): Promise<LifeItem> {
    const db = await getDB();
    const id = uuidv4();
    const inventoryId = uuidv4();
    const now = new Date().toISOString();

    const newItem: LifeItem = {
      id,
      type: 'inventory',
      title: `${name} (${quantity}${unit ? ` ${unit}` : ''})`,
      description: notes,
      status: 'pending',
      startAt: expiryDate || now,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO life_items (id, type, title, description, status, start_at, created_at, updated_at)
         VALUES (?, 'inventory', ?, ?, 'pending', ?, ?, ?);`,
        [id, newItem.title, notes || null, expiryDate || now, now, now]
      );

      tx.executeSql(
        `INSERT INTO inventory_items (id, life_item_id, quantity, unit, location, purchase_date, expiry_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          inventoryId,
          id,
          quantity,
          unit || null,
          location || null,
          purchaseDate || null,
          expiryDate || null,
          notes || null,
        ]
      );

      // If expiry date is provided, create linked expiry record (no duplicate lifeItem)
      if (expiryDate) {
        tx.executeSql(
          `INSERT INTO expiry_records (id, life_item_id, expiry_type, expiry_date, warning_days)
           VALUES (?, ?, 'food', ?, 7);`,
          [uuidv4(), id, expiryDate]
        );
      }
    });

    return newItem;
  },

  async createParkingComposite(
    floor?: string,
    slot?: string,
    locationNotes?: string
  ): Promise<LifeItem> {
    const db = await getDB();
    const id = uuidv4();
    const parkingId = uuidv4();
    const now = new Date().toISOString();

    const title = `Parked at ${floor ? `Floor ${floor}` : ''}${slot ? ` Slot ${slot}` : ' Car Spot'}`.trim();

    const newItem: LifeItem = {
      id,
      type: 'parking',
      title,
      description: locationNotes,
      status: 'pending',
      startAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO life_items (id, type, title, description, status, start_at, created_at, updated_at)
         VALUES (?, 'parking', ?, ?, 'pending', ?, ?, ?);`,
        [id, title, locationNotes || null, now, now, now]
      );

      tx.executeSql(
        `INSERT INTO parking_records (id, life_item_id, floor, slot, location_notes, parked_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [parkingId, id, floor || null, slot || null, locationNotes || null, now]
      );
    });

    return newItem;
  },

  async findReminderByLifeItemId(lifeItemId: string): Promise<Reminder | null> {
    const db = await getDB();
    const [res] = await db.executeSql('SELECT * FROM reminders WHERE life_item_id = ?;', [lifeItemId]);
    if (res.rows.length === 0) return null;
    const row = res.rows.item(0);
    return {
      id: row.id,
      lifeItemId: row.life_item_id,
      reminderAt: row.reminder_at,
      reminderOffsetMinutes: row.reminder_offset_minutes,
      repeatRuleId: row.repeat_rule_id,
      isEnabled: Boolean(row.is_enabled),
      notificationId: row.notification_id || undefined,
    };
  },

  async updateReminderNotificationId(lifeItemId: string, notificationId: string): Promise<void> {
    const db = await getDB();
    await db.executeSql('UPDATE reminders SET notification_id = ? WHERE life_item_id = ?;', [
      notificationId,
      lifeItemId,
    ]);
  },

  async updateReminderTime(lifeItemId: string, newReminderAt: string): Promise<void> {
    const db = await getDB();
    const now = new Date().toISOString();
    await db.transaction((tx) => {
      tx.executeSql('UPDATE life_items SET start_at = ?, updated_at = ? WHERE id = ?;', [
        newReminderAt,
        now,
        lifeItemId,
      ]);
      tx.executeSql('UPDATE reminders SET reminder_at = ? WHERE life_item_id = ?;', [
        newReminderAt,
        lifeItemId,
      ]);
    });
  },

  async findRecurrenceRuleByLifeItemId(lifeItemId: string): Promise<any | null> {
    const db = await getDB();
    const [res] = await db.executeSql('SELECT * FROM recurrence_rules WHERE life_item_id = ?;', [lifeItemId]);
    if (res.rows.length === 0) return null;
    const row = res.rows.item(0);
    return {
      id: row.id,
      lifeItemId: row.life_item_id,
      frequency: row.frequency,
      interval: row.interval,
      byWeekday: row.by_weekday,
      byMonthDay: row.by_month_day,
      startDate: row.start_date,
      endDate: row.end_date,
      timezone: row.timezone,
    };
  },

  async findAllPendingReminders(): Promise<{ item: LifeItem; reminder: Reminder }[]> {
    const db = await getDB();
    const [res] = await db.executeSql(`
      SELECT l.*, r.id as reminder_id, r.reminder_at, r.reminder_offset_minutes, r.repeat_rule_id, r.is_enabled, r.notification_id
      FROM life_items l
      JOIN reminders r ON l.id = r.life_item_id
      WHERE l.status = 'pending' AND l.type = 'reminder';
    `);
    const list: { item: LifeItem; reminder: Reminder }[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      const row = res.rows.item(i);
      list.push({
        item: {
          id: row.id,
          type: row.type,
          title: row.title,
          description: row.description,
          categoryId: row.category_id,
          status: row.status,
          priority: row.priority,
          startAt: row.start_at,
          endAt: row.end_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          archivedAt: row.archived_at,
        },
        reminder: {
          id: row.reminder_id,
          lifeItemId: row.id,
          reminderAt: row.reminder_at,
          reminderOffsetMinutes: row.reminder_offset_minutes,
          repeatRuleId: row.repeat_rule_id,
          isEnabled: Boolean(row.is_enabled),
          notificationId: row.notification_id || undefined,
        },
      });
    }
    return list;
  },
};
