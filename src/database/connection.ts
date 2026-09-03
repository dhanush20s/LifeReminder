import SQLite from 'react-native-sqlite-storage';
import { format, addDays, subDays, setHours, setMinutes } from 'date-fns';

SQLite.enablePromise(true);

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }
  try {
    dbInstance = await SQLite.openDatabase({
      name: 'LifeReminder.db',
      location: 'default',
    });
    return dbInstance;
  } catch (error) {
    console.error('Failed to open SQLite database:', error);
    throw error;
  }
};

export const initDatabase = async (): Promise<void> => {
  const db = await getDB();
  
  await db.transaction((tx) => {
    // 1. life_items
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS life_items (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category_id TEXT,
        status TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        start_at TEXT,
        end_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        archived_at TEXT
      );
    `);

    // 2. recurrence_rules
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS recurrence_rules (
        id TEXT PRIMARY KEY,
        life_item_id TEXT,
        frequency TEXT NOT NULL,
        interval INTEGER DEFAULT 1,
        by_weekday TEXT,
        by_month_day INTEGER,
        start_date TEXT NOT NULL,
        end_date TEXT,
        timezone TEXT NOT NULL
      );
    `);

    // 3. reminders
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        life_item_id TEXT NOT NULL,
        reminder_at TEXT NOT NULL,
        reminder_offset_minutes INTEGER DEFAULT 0,
        repeat_rule_id TEXT,
        is_enabled INTEGER DEFAULT 1,
        FOREIGN KEY (life_item_id) REFERENCES life_items(id) ON DELETE CASCADE
      );
    `);

    // 4. expense_categories
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS expense_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        is_default INTEGER DEFAULT 0
      );
    `);

    // Seed default categories if empty
    tx.executeSql('SELECT COUNT(*) as count FROM expense_categories;', [], (_, result) => {
      if (result.rows.item(0).count === 0) {
        const defaults = [
          ['cat_food', 'Food', 'Utensils', 1],
          ['cat_travel', 'Travel', 'Car', 1],
          ['cat_bills', 'Bills', 'CreditCard', 1],
          ['cat_shopping', 'Shopping', 'ShoppingBag', 1],
          ['cat_health', 'Health', 'HeartPulse', 1],
          ['cat_other', 'Other', 'MoreHorizontal', 1],
        ];
        defaults.forEach(([id, name, icon, isDef]) => {
          tx.executeSql(
            'INSERT INTO expense_categories (id, name, icon, is_default) VALUES (?, ?, ?, ?);',
            [id, name, icon, isDef]
          );
        });
      }
    });

    // 5. expenses
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        amount_minor INTEGER NOT NULL,
        category_id TEXT NOT NULL,
        description TEXT,
        expense_date TEXT NOT NULL,
        payment_method TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES expense_categories(id)
      );
    `);

    // 6. bills
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        life_item_id TEXT NOT NULL,
        amount_minor INTEGER NOT NULL,
        due_date TEXT NOT NULL,
        repeat_rule_id TEXT,
        status TEXT NOT NULL,
        FOREIGN KEY (life_item_id) REFERENCES life_items(id) ON DELETE CASCADE
      );
    `);

    // 7. checklists
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS checklists (
        id TEXT PRIMARY KEY,
        life_item_id TEXT NOT NULL,
        schedule_rule_id TEXT,
        alarm_enabled INTEGER DEFAULT 0,
        alarm_time TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (life_item_id) REFERENCES life_items(id) ON DELETE CASCADE
      );
    `);

    // 8. checklist_items
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS checklist_items (
        id TEXT PRIMARY KEY,
        checklist_id TEXT NOT NULL,
        title TEXT NOT NULL,
        position INTEGER NOT NULL,
        is_completed INTEGER DEFAULT 0,
        FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
      );
    `);

    // 9. expiry_records
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS expiry_records (
        id TEXT PRIMARY KEY,
        life_item_id TEXT NOT NULL,
        expiry_type TEXT NOT NULL,
        expiry_date TEXT NOT NULL,
        warning_days INTEGER DEFAULT 7,
        FOREIGN KEY (life_item_id) REFERENCES life_items(id) ON DELETE CASCADE
      );
    `);

    // 10. borrow_records
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS borrow_records (
        id TEXT PRIMARY KEY,
        life_item_id TEXT NOT NULL,
        direction TEXT NOT NULL,
        person_name TEXT NOT NULL,
        item_name TEXT,
        amount_minor INTEGER,
        borrowed_at TEXT NOT NULL,
        expected_return_at TEXT,
        returned_at TEXT,
        status TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (life_item_id) REFERENCES life_items(id) ON DELETE CASCADE
      );
    `);

    // 11. inbox_items
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS inbox_items (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        processed_at TEXT,
        converted_type TEXT,
        converted_id TEXT
      );
    `);

    // 12. Seed Sample Data matching Reference Image if life_items is empty
    tx.executeSql('SELECT COUNT(*) as count FROM life_items;', [], (_, res) => {
      if (res.rows.item(0).count === 0) {
        seedInitialSampleData(tx);
      }
    });
  });
};

const seedInitialSampleData = (tx: any) => {
  const now = new Date();
  const todayIso = now.toISOString();
  const todayStr = format(now, 'yyyy-MM-dd');

  // Dates
  const today10AM = setMinutes(setHours(now, 10), 0).toISOString();
  const today6PM = setMinutes(setHours(now, 18), 0).toISOString();
  const today630AM = setMinutes(setHours(now, 6), 30).toISOString();

  const tomorrow1030AM = setMinutes(setHours(addDays(now, 1), 10), 30).toISOString();
  const in5Days = addDays(now, 5).toISOString();
  const in9Days = addDays(now, 9).toISOString();
  const past2Days = subDays(now, 2).toISOString();

  // 1. Needs Attention Items
  // Electricity Bill (Bill, due today, ₹2,450)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_bill_1', 'bill', 'Electricity Bill', 'Due today · ₹2,450', 'overdue', 'high', ?, ?, ?);`,
    [todayIso, todayIso, todayIso]
  );
  tx.executeSql(
    `INSERT INTO bills (id, life_item_id, amount_minor, due_date, status)
     VALUES ('b_1', 'demo_bill_1', 245000, ?, 'overdue');`,
    [todayStr]
  );

  // Passport Renewal (Expiry, expires in 5 days)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_exp_1', 'expiry', 'Passport Renewal', 'Expires in 5 days', 'pending', 'high', ?, ?, ?);`,
    [in5Days, todayIso, todayIso]
  );
  tx.executeSql(
    `INSERT INTO expiry_records (id, life_item_id, expiry_type, expiry_date, warning_days)
     VALUES ('e_1', 'demo_exp_1', 'document', ?, 7);`,
    [in5Days]
  );

  // Return Rahul's Charger (Borrow, overdue by 2 days)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_bor_1', 'borrow', 'Return Rahul''s Charger', 'Overdue by 2 days', 'overdue', 'high', ?, ?, ?);`,
    [past2Days, todayIso, todayIso]
  );
  tx.executeSql(
    `INSERT INTO borrow_records (id, life_item_id, direction, person_name, item_name, borrowed_at, expected_return_at, status)
     VALUES ('br_1', 'demo_bor_1', 'borrowed', 'Rahul', 'Charger', ?, ?, 'overdue');`,
    [past2Days, past2Days]
  );

  // 2. Today Items
  // Team Meeting (Reminder, 10:00 AM)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_rem_1', 'reminder', 'Team Meeting', 'Work call', 'pending', 'normal', ?, ?, ?);`,
    [today10AM, todayIso, todayIso]
  );

  // Buy Groceries (Task/Checklist, 6:00 PM)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_chk_1', 'checklist', 'Buy Groceries', 'Personal items', 'pending', 'normal', ?, ?, ?);`,
    [today6PM, todayIso, todayIso]
  );

  // Morning Workout (Task, 6:30 AM, Completed)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_tsk_1', 'reminder', 'Morning Workout', 'Health session', 'completed', 'normal', ?, ?, ?);`,
    [today630AM, todayIso, todayIso]
  );

  // 3. Upcoming Items
  // Dentist Appointment (Tomorrow, 10:30 AM)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_up_1', 'reminder', 'Dentist Appointment', '10:30 AM', 'pending', 'normal', ?, ?, ?);`,
    [tomorrow1030AM, todayIso, todayIso]
  );

  // Netflix Subscription (In 5 days, ₹649)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_up_2', 'subscription', 'Netflix Subscription', 'Monthly · ₹649', 'pending', 'normal', ?, ?, ?);`,
    [in5Days, todayIso, todayIso]
  );
  tx.executeSql(
    `INSERT INTO bills (id, life_item_id, amount_minor, due_date, status)
     VALUES ('b_2', 'demo_up_2', 64900, ?, 'pending');`,
    [in5Days]
  );

  // Car Insurance Renewal (In 9 days, ₹6,200)
  tx.executeSql(
    `INSERT INTO life_items (id, type, title, description, status, priority, start_at, created_at, updated_at)
     VALUES ('demo_up_3', 'expiry', 'Car Insurance Renewal', '₹6,200', 'pending', 'normal', ?, ?, ?);`,
    [in9Days, todayIso, todayIso]
  );

  // 4. Sample Expenses (Monthly total ₹12,400)
  tx.executeSql(
    `INSERT INTO expenses (id, amount_minor, category_id, description, expense_date, created_at, updated_at)
     VALUES ('exp_1', 540000, 'cat_shopping', 'Shopping', ?, ?, ?);`,
    [todayStr, todayIso, todayIso]
  );
  tx.executeSql(
    `INSERT INTO expenses (id, amount_minor, category_id, description, expense_date, created_at, updated_at)
     VALUES ('exp_2', 300000, 'cat_travel', 'Travel fuel', ?, ?, ?);`,
    [todayStr, todayIso, todayIso]
  );
  tx.executeSql(
    `INSERT INTO expenses (id, amount_minor, category_id, description, expense_date, created_at, updated_at)
     VALUES ('exp_3', 400000, 'cat_food', 'Dining out', ?, ?, ?);`,
    [todayStr, todayIso, todayIso]
  );

  // 5. Unprocessed Inbox Items (5 items)
  for (let i = 1; i <= 5; i++) {
    tx.executeSql(
      `INSERT INTO inbox_items (id, content, created_at)
       VALUES (?, ?, ?);`,
      [`inbox_${i}`, `Idea / Note #${i} from Brain Dump`, todayIso]
    );
  }
};
