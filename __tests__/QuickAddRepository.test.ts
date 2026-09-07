import { quickAddRepository, DEFAULT_SHORTCUTS } from '../src/database/repositories/quickAddRepository';

describe('QuickAddRepository Unit Tests', () => {
  it('should return default active shortcuts', async () => {
    const active = await quickAddRepository.getActiveShortcuts();
    expect(Array.isArray(active)).toBe(true);
    expect(active.length).toBeGreaterThan(0);
    expect(active[0]).toHaveProperty('id');
    expect(active[0]).toHaveProperty('type');
    expect(active[0]).toHaveProperty('label');
  });

  it('should return default available shortcuts', async () => {
    const available = await quickAddRepository.getAvailableShortcuts();
    expect(Array.isArray(available)).toBe(true);
  });

  it('should allow saving shortcuts order without errors', async () => {
    const active = DEFAULT_SHORTCUTS.filter((s) => s.isActive);
    const available = DEFAULT_SHORTCUTS.filter((s) => !s.isActive);
    await expect(quickAddRepository.saveShortcutsOrder(active, available)).resolves.not.toThrow();
  });
});
