import { GET, POST, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock global fetch
global.fetch = jest.fn();

describe('Jules API Proxy', () => {
  const mockApiKey = 'test-api-key';
  const baseUrl = 'http://localhost:3000/api/jules';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if API key is missing', async () => {
      const req = new NextRequest(baseUrl);
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: 'API key required' });
    });

    it('should proxy GET request successfully', async () => {
      const mockResponseData = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const req = new NextRequest(`${baseUrl}?path=/test`, {
        headers: { 'x-jules-api-key': mockApiKey },
      });

      const res = await GET(req);
      const data = await res.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://jules.googleapis.com/v1alpha/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-Goog-Api-Key': mockApiKey,
          }),
        })
      );
      expect(res.status).toBe(200);
      expect(data).toEqual(mockResponseData);
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const req = new NextRequest(`${baseUrl}?path=/test`, {
        headers: { 'x-jules-api-key': mockApiKey },
      });

      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Proxy error', message: 'Network error' });
    });

    it('should handle and log complex activity data without crashing', async () => {
      // Mock data that triggers the detailed logging logic in route.ts
      const mockComplexData = {
        activities: [
          {
            name: 'activity/1',
            createTime: '2023-01-01T00:00:00Z',
            type: 'run_command',
            artifacts: [
              {
                changeSet: {
                  gitPatch: { unidiffPatch: 'diff --git...' }
                }
              },
              {
                changeSet: {
                  unidiffPatch: 'diff --git...'
                }
              },
              {
                bashOutput: { output: 'command output' }
              }
            ]
          },
          {
            sessionCompleted: {}
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockComplexData,
      });

      // The path must include '/activities' to trigger the logging logic
      const req = new NextRequest(`${baseUrl}?path=/activities`, {
        headers: { 'x-jules-api-key': mockApiKey },
      });

      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockComplexData);
      
      // Since we mocked console.log in beforeEach, we can verify it was called
      // This confirms the logging logic was actually entered
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Jules API Proxy] Activity types:'),
        expect.anything()
      );
    });
  });

  describe('POST', () => {
    it('should return 401 if API key is missing', async () => {
      const req = new NextRequest(baseUrl, { method: 'POST' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: 'API key required' });
    });

    it('should proxy POST request successfully', async () => {
      const mockRequestBody = { foo: 'bar' };
      const mockResponseData = { success: true };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockResponseData,
      });

      const req = new NextRequest(`${baseUrl}?path=/create`, {
        method: 'POST',
        headers: { 
          'x-jules-api-key': mockApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockRequestBody),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://jules.googleapis.com/v1alpha/create',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Goog-Api-Key': mockApiKey,
          }),
          // Body parsing in fetch mock needs careful handling if we want to assert it exactly,
          // but here we just check the call happened.
          // Note: NextRequest body handling in test environment might differ slightly from real server
        })
      );
      expect(res.status).toBe(201);
      expect(data).toEqual(mockResponseData);
    });
  });

  describe('DELETE', () => {
    it('should return 401 if API key is missing', async () => {
      const req = new NextRequest(baseUrl, { method: 'DELETE' });
      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: 'API key required' });
    });

    it('should proxy DELETE request successfully', async () => {
      const mockResponseData = { deleted: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const req = new NextRequest(`${baseUrl}?path=/delete/1`, {
        method: 'DELETE',
        headers: { 'x-jules-api-key': mockApiKey },
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://jules.googleapis.com/v1alpha/delete/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-Goog-Api-Key': mockApiKey,
          }),
        })
      );
      expect(res.status).toBe(200);
      expect(data).toEqual(mockResponseData);
    });
  });
});
