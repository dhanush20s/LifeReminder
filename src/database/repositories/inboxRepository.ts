import { getDB } from '../connection';
import { InboxItem, LifeItemType } from '../../types/lifeItem';
import { generateUUID as uuidv4 } from '../../utils/uuid';

export const inboxRepository = {
  async create(content: string): Promise<InboxItem> {
    const db = await getDB();
    const id = uuidv4();
    const now = new Date().toISOString();

    const item: InboxItem = {
      id,
      content,
      createdAt: now,
    };

    await db.executeSql(
      'INSERT INTO inbox_items (id, content, created_at) VALUES (?, ?, ?);',
      [item.id, item.content, item.createdAt]
    );

    return item;
  },

  async findUnprocessed(): Promise<InboxItem[]> {
    const db = await getDB();
    const [results] = await db.executeSql(
      'SELECT * FROM inbox_items WHERE processed_at IS NULL ORDER BY created_at DESC;'
    );
    const items: InboxItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      items.push({
        id: row.id,
        content: row.content,
        createdAt: row.created_at,
        processedAt: row.processed_at,
        convertedType: row.converted_type as LifeItemType,
        convertedId: row.converted_id,
      });
    }
    return items;
  },

  async markProcessed(id: string, convertedType: LifeItemType, convertedId: string): Promise<void> {
    const db = await getDB();
    const now = new Date().toISOString();
    await db.executeSql(
      'UPDATE inbox_items SET processed_at = ?, converted_type = ?, converted_id = ? WHERE id = ?;',
      [now, convertedType, convertedId, id]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.executeSql('DELETE FROM inbox_items WHERE id = ?;', [id]);
  },
};
