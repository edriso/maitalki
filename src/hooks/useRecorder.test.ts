import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRecorder } from './useRecorder';

class MockMediaRecorder extends EventTarget {
  mimeType = 'audio/webm';
  state: RecordingState = 'inactive';
  stop = vi.fn(() => {
    this.state = 'inactive';
    this.dispatchEvent(new Event('stop'));
  });

  start() {
    this.state = 'recording';
  }
}

describe('useRecorder', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('automatically stops a recording after two minutes', async () => {
    vi.useFakeTimers();
    const trackStop = vi.fn();
    const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    vi.stubGlobal('MediaRecorder', MockMediaRecorder);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-recording');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const { result } = renderHook(() => useRecorder());
    await act(async () => result.current.start());
    expect(result.current.status).toBe('recording');

    act(() => vi.advanceTimersByTime(120_000));

    expect(result.current.seconds).toBe(120);
    expect(result.current.status).toBe('ready');
    expect(trackStop).toHaveBeenCalled();
  });
});
