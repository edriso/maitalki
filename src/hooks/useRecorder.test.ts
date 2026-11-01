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

const mockMicrophone = () => {
  const trackStop = vi.fn();
  const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
  });
  vi.stubGlobal('MediaRecorder', MockMediaRecorder);
  let count = 0;
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:take-${++count}`);
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  return { trackStop, revoke };
};

describe('useRecorder', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps two takes and replaces only the second on a new recording', async () => {
    const { revoke } = mockMicrophone();
    const { result } = renderHook(() => useRecorder());
    for (let take = 0; take < 3; take += 1) {
      await act(async () => result.current.start());
      act(() => { result.current.stop(); });
    }
    expect(result.current.takes.map((take) => take.url)).toEqual(['blob:take-1', 'blob:take-3']);
    expect(revoke).toHaveBeenCalledWith('blob:take-2');

    act(() => result.current.reset());
    expect(result.current.takes).toEqual([]);
    expect(result.current.status).toBe('idle');
    expect(revoke).toHaveBeenCalledWith('blob:take-3');
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
