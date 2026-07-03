const { fetchWithRetry } = require('../utils/fetchWrapper');

describe('fetchWithRetry', () => {
  it('returns response on success', async () => {
    const mockResponse = { status: 200, data: 'ok' };
    const httpClient = { get: vi.fn().mockResolvedValue(mockResponse) };

    const result = await fetchWithRetry('https://example.com', { httpClient });
    expect(result).toEqual(mockResponse);
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds', async () => {
    const mockResponse = { status: 200, data: 'ok' };
    const httpClient = {
      get: vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(mockResponse),
    };

    const result = await fetchWithRetry('https://example.com', { httpClient, retryDelay: 10 });
    expect(result).toEqual(mockResponse);
    expect(httpClient.get).toHaveBeenCalledTimes(2);
  });

  it('fails after max retries', async () => {
    const httpClient = { get: vi.fn().mockRejectedValue(new Error('always fail')) };

    await expect(
      fetchWithRetry('https://example.com', { httpClient, retries: 2, retryDelay: 10 })
    ).rejects.toThrow('always fail');
    expect(httpClient.get).toHaveBeenCalledTimes(3);
  });

  it('uses custom timeout and retries config', async () => {
    const mockResponse = { status: 200 };
    const httpClient = {
      get: vi.fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce(mockResponse),
    };

    const result = await fetchWithRetry('https://example.com', {
      timeout: 1000,
      retries: 1,
      retryDelay: 10,
      httpClient,
    });
    expect(result).toEqual(mockResponse);
    expect(httpClient.get).toHaveBeenCalledTimes(2);
    expect(httpClient.get).toHaveBeenCalledWith('https://example.com', { timeout: 1000 });
  });
});
