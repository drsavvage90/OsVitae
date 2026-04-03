import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlash } from './useFlash';

describe('useFlash', () => {
  it('starts with no visible toast', () => {
    const { result } = renderHook(() => useFlash());
    expect(result.current.toast.visible).toBe(false);
    expect(result.current.toast.msg).toBe('');
  });

  it('shows a toast when flash is called', () => {
    const { result } = renderHook(() => useFlash());
    act(() => {
      result.current.flash('Hello!');
    });
    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.msg).toBe('Hello!');
  });

  it('hides the toast after the timeout', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlash());

    act(() => {
      result.current.flash('Temporary');
    });
    expect(result.current.toast.visible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(result.current.toast.visible).toBe(false);
    expect(result.current.toast.msg).toBe('Temporary');

    vi.useRealTimers();
  });

  it('replaces the previous toast when flash is called again', () => {
    const { result } = renderHook(() => useFlash());
    act(() => {
      result.current.flash('First');
    });
    expect(result.current.toast.msg).toBe('First');

    act(() => {
      result.current.flash('Second');
    });
    expect(result.current.toast.msg).toBe('Second');
    expect(result.current.toast.visible).toBe(true);
  });
});
