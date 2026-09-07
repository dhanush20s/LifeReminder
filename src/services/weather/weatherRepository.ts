import { getDB } from '../../database/connection';
import { WeatherData } from './weatherTypes';

export const weatherRepository = {
  /**
   * Save successful WeatherData to local SQLite weather_cache table.
   */
  async saveCache(data: WeatherData): Promise<void> {
    const db = await getDB();
    await db.executeSql(
      `INSERT OR REPLACE INTO weather_cache (id, temperature, condition, condition_icon, location_name, timestamp)
       VALUES ('latest', ?, ?, ?, ?, ?);`,
      [data.temperature, data.condition, data.conditionIcon, data.locationName, data.timestamp]
    );
  },

  /**
   * Get cached WeatherData from local SQLite weather_cache table.
   */
  async getCache(): Promise<WeatherData | null> {
    const db = await getDB();
    const [results] = await db.executeSql(`SELECT * FROM weather_cache WHERE id = 'latest';`);

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return {
        temperature: row.temperature,
        condition: row.condition,
        conditionIcon: row.condition_icon,
        locationName: row.location_name,
        timestamp: row.timestamp,
      };
    }
    return null;
  },

  /**
   * Clear cached weather data.
   */
  async clearCache(): Promise<void> {
    const db = await getDB();
    await db.executeSql(`DELETE FROM weather_cache WHERE id = 'latest';`);
  },
};
