import { renderHook, act } from '@testing-library/react';

import useScrollToElement from '../useScrollToElement';

describe('useScrollToElement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return an elementRef', () => {
    const { result } = renderHook(() =>
      useScrollToElement({
        scrollToElement: false,
        scrollOptions: { behavior: 'smooth' },
      })
    );

    expect(result.current.elementRef).toBeDefined();
    expect(result.current.elementRef.current).toBeUndefined();
  });

  it('should not scroll when scrollToElement is false', () => {
    const mockScrollIntoView = jest.fn();
    const mockElement = { scrollIntoView: mockScrollIntoView };

    const { result } = renderHook(() =>
      useScrollToElement({
        scrollToElement: false,
        scrollOptions: { behavior: 'smooth' },
      })
    );

    // Manually set the ref
    (result.current.elementRef as React.MutableRefObject<HTMLDivElement | undefined>).current =
      mockElement as unknown as HTMLDivElement;

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it('should scroll when scrollToElement is true and element exists', () => {
    const mockScrollIntoView = jest.fn();
    const mockElement = { scrollIntoView: mockScrollIntoView };
    const scrollOptions = { behavior: 'smooth' as ScrollBehavior, block: 'start' as ScrollLogicalPosition };

    const { result } = renderHook(() =>
      useScrollToElement({
        scrollToElement: true,
        scrollOptions,
      })
    );

    // Manually set the ref
    (result.current.elementRef as React.MutableRefObject<HTMLDivElement | undefined>).current =
      mockElement as unknown as HTMLDivElement;

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollIntoView).toHaveBeenCalledWith(scrollOptions);
  });

  it('should only scroll once per scrollToElement toggle', () => {
    const mockScrollIntoView = jest.fn();
    const mockElement = { scrollIntoView: mockScrollIntoView };
    const scrollOptions = { behavior: 'smooth' as ScrollBehavior };

    const { result, rerender } = renderHook(
      ({ scrollToElement }) =>
        useScrollToElement({
          scrollToElement,
          scrollOptions,
        }),
      { initialProps: { scrollToElement: true } }
    );

    // Set the ref
    (result.current.elementRef as React.MutableRefObject<HTMLDivElement | undefined>).current =
      mockElement as unknown as HTMLDivElement;

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);

    // Rerender with same props
    rerender({ scrollToElement: true });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should not scroll again
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('should reset scrolled state when scrollToElement becomes false', () => {
    const mockScrollIntoView = jest.fn();
    const mockElement = { scrollIntoView: mockScrollIntoView };
    const scrollOptions = { behavior: 'smooth' as ScrollBehavior };

    const { result, rerender } = renderHook(
      ({ scrollToElement }) =>
        useScrollToElement({
          scrollToElement,
          scrollOptions,
        }),
      { initialProps: { scrollToElement: true } }
    );

    // Set the ref
    (result.current.elementRef as React.MutableRefObject<HTMLDivElement | undefined>).current =
      mockElement as unknown as HTMLDivElement;

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);

    // Toggle scrollToElement to false
    rerender({ scrollToElement: false });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Toggle back to true - should scroll again
    rerender({ scrollToElement: true });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollIntoView).toHaveBeenCalledTimes(2);
  });

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() =>
      useScrollToElement({
        scrollToElement: true,
        scrollOptions: { behavior: 'smooth' },
      })
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should not scroll when element ref is undefined', () => {
    const { result } = renderHook(() =>
      useScrollToElement({
        scrollToElement: true,
        scrollOptions: { behavior: 'smooth' },
      })
    );

    // elementRef.current is undefined by default

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // No error should be thrown
    expect(result.current.elementRef.current).toBeUndefined();
  });
});

