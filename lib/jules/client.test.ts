import { JulesClient, JulesAPIError } from "./client";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("JulesClient", () => {
  const apiKey = "test-api-key";
  let client: JulesClient;

  beforeEach(() => {
    client = new JulesClient(apiKey);
    mockFetch.mockClear();
  });

  describe("constructor", () => {
    it("should be instantiated with an API key", () => {
      expect(client).toBeInstanceOf(JulesClient);
    });
  });

  describe("listSessions", () => {
    it("should fetch sessions and map states correctly", async () => {
      const mockResponse = {
        sessions: [
          {
            id: "sess-1",
            state: "ACTIVE",
            createTime: "2023-01-01T00:00:00Z",
            sourceContext: { source: "sources/github/owner/repo" },
          },
          {
            id: "sess-2",
            state: "COMPLETED",
            createTime: "2023-01-02T00:00:00Z",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const sessions = await client.listSessions();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/jules?path=%2Fsessions"),
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Jules-Api-Key": apiKey }),
        }),
      );

      expect(sessions).toHaveLength(2);
      expect(sessions[0].status).toBe("active");
      expect(sessions[1].status).toBe("completed");
      expect(sessions[0].sourceId).toBe("owner/repo");
    });
  });

  describe("listActivities", () => {
    const sessionId = "session-123";

    it("should correctly map a planGenerated activity", async () => {
      const mockResponse = {
        activities: [
          {
            name: "sessions/123/activities/act-1",
            createTime: "2023-01-01T00:00:00Z",
            originator: "agent",
            planGenerated: {
              plan: {
                title: "Test Plan",
                steps: [{ text: "step 1" }],
              },
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const activities = await client.listActivities(sessionId);

      expect(activities[0].type).toBe("plan");
      expect(activities[0].content).toContain("Test Plan");
      expect(activities[0].role).toBe("agent");
    });

    it("should correctly map a progressUpdated activity", async () => {
      const mockResponse = {
        activities: [
          {
            name: "sessions/123/activities/act-2",
            createTime: "2023-01-01T00:00:00Z",
            originator: "agent",
            progressUpdated: {
              description: "Working on it...",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const activities = await client.listActivities(sessionId);

      expect(activities[0].type).toBe("progress");
      expect(activities[0].content).toBe("Working on it...");
    });

    it("should extract git patch from artifacts", async () => {
      const mockResponse = {
        activities: [
          {
            name: "sessions/123/activities/act-3",
            createTime: "2023-01-01T00:00:00Z",
            originator: "agent",
            agentMessaged: { message: "Here is the code" },
            artifacts: [
              {
                changeSet: {
                  gitPatch: {
                    unidiffPatch: "diff --git a/file.ts b/file.ts",
                  },
                },
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const activities = await client.listActivities(sessionId);

      expect(activities[0].diff).toBe("diff --git a/file.ts b/file.ts");
    });

    it("should extract bash output from artifacts", async () => {
      const mockResponse = {
        activities: [
          {
            name: "sessions/123/activities/act-4",
            createTime: "2023-01-01T00:00:00Z",
            originator: "agent",
            progressUpdated: { message: "Running command" },
            artifacts: [
              {
                bashOutput: {
                  output: "Success\n",
                },
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const activities = await client.listActivities(sessionId);

      expect(activities[0].bashOutput).toBe("Success\n");
    });
  });

  describe("Error Handling", () => {
    it("should throw JulesAPIError on 401", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Unauthorized" } }),
      });

      await expect(client.listSessions()).rejects.toThrow(JulesAPIError);
      await expect(client.listSessions()).rejects.toThrow("Invalid API key");
    });

    it("should throw JulesAPIError on network failure", async () => {
      mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(client.listSessions()).rejects.toThrow(JulesAPIError);
      await expect(client.listSessions()).rejects.toThrow("Unable to connect");
    });
  });
});
