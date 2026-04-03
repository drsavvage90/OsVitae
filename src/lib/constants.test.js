import { describe, it, expect } from 'vitest';
import { WS_ICON_OPTIONS, TASK_TYPES, STORY_POINTS } from './constants';

describe('WS_ICON_OPTIONS', () => {
  it('has no duplicate keys', () => {
    const keys = WS_ICON_OPTIONS.map(o => o.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every entry has a key and component', () => {
    WS_ICON_OPTIONS.forEach(opt => {
      expect(opt.key).toBeTruthy();
      expect(opt.component).toBeDefined();
    });
  });
});

describe('TASK_TYPES', () => {
  it('has valid hex color values', () => {
    TASK_TYPES.forEach(t => {
      expect(t.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('has no duplicate keys', () => {
    const keys = TASK_TYPES.map(t => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every entry has required fields', () => {
    TASK_TYPES.forEach(t => {
      expect(t).toHaveProperty('key');
      expect(t).toHaveProperty('label');
      expect(t).toHaveProperty('color');
      expect(t).toHaveProperty('icon');
    });
  });
});

describe('STORY_POINTS', () => {
  it('is a valid Fibonacci sequence subset', () => {
    const fib = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    STORY_POINTS.forEach(sp => {
      expect(fib).toContain(sp);
    });
  });

  it('is sorted in ascending order', () => {
    for (let i = 1; i < STORY_POINTS.length; i++) {
      expect(STORY_POINTS[i]).toBeGreaterThan(STORY_POINTS[i - 1]);
    }
  });

  it('contains only positive integers', () => {
    STORY_POINTS.forEach(sp => {
      expect(Number.isInteger(sp)).toBe(true);
      expect(sp).toBeGreaterThan(0);
    });
  });
});

describe('getWsIcon', () => {
  // getWsIcon returns JSX (React elements), so we test it via the constants module
  // We import it separately since it's a function that returns JSX
  it('is exported from constants', async () => {
    const mod = await import('./constants');
    expect(typeof mod.getWsIcon).toBe('function');
  });

  it('returns a React element for a known key', async () => {
    const { getWsIcon } = await import('./constants');
    const icon = getWsIcon('Monitor');
    expect(icon).toBeDefined();
    expect(icon.props.size).toBe(16);
  });

  it('returns a fallback Folder icon for an unknown key', async () => {
    const { getWsIcon } = await import('./constants');
    const icon = getWsIcon('NonExistentIcon');
    expect(icon).toBeDefined();
    // Fallback is <Folder size={size} />
    expect(icon.props.size).toBe(16);
  });
});
