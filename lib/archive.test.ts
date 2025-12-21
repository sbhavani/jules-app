import {
  getArchivedSessions,
  archiveSession,
  unarchiveSession,
  isSessionArchived,
} from "./archive";

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

describe("Archive Utility", () => {
  const LOCAL_STORAGE_KEY = "jules-archived-sessions";

  beforeAll(() => {
    // Define window.localStorage manually for Node environment
    Object.defineProperty(global, "window", {
      value: {
        localStorage: localStorageMock,
      },
      writable: true,
    });

    // Define localStorage globally
    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  afterAll(() => {
    // Cleanup
    // @ts-expect-error: Deleting global properties for cleanup
    delete global.window;
    // @ts-expect-error: Deleting global properties for cleanup
    delete global.localStorage;
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("getArchivedSessions", () => {
    it("should return an empty Set when localStorage is empty", () => {
      const sessions = getArchivedSessions();
      expect(sessions).toBeInstanceOf(Set);
      expect(sessions.size).toBe(0);
    });

    it("should return a Set with stored session IDs", () => {
      const storedIds = ["session-1", "session-2"];
      localStorageMock.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedIds));

      const sessions = getArchivedSessions();
      expect(sessions.size).toBe(2);
      expect(sessions.has("session-1")).toBe(true);
      expect(sessions.has("session-2")).toBe(true);
    });

    it("should return an empty Set if localStorage contains invalid JSON", () => {
      localStorageMock.setItem(LOCAL_STORAGE_KEY, "invalid-json");

      const sessions = getArchivedSessions();
      expect(sessions).toBeInstanceOf(Set);
      expect(sessions.size).toBe(0);
    });
  });

  describe("archiveSession", () => {
    it("should add a session ID to localStorage", () => {
      archiveSession("new-session");

      const stored = localStorageMock.getItem(LOCAL_STORAGE_KEY);
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toContain("new-session");
    });

    it("should not duplicate session IDs", () => {
      archiveSession("session-1");
      archiveSession("session-1");

      const stored = localStorageMock.getItem(LOCAL_STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed).toContain("session-1");
    });

    it("should preserve existing sessions", () => {
      localStorageMock.setItem(LOCAL_STORAGE_KEY, JSON.stringify(["existing"]));
      archiveSession("new-session");

      const stored = localStorageMock.getItem(LOCAL_STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed).toContain("existing");
      expect(parsed).toContain("new-session");
    });
  });

  describe("unarchiveSession", () => {
    it("should remove a session ID from localStorage", () => {
      localStorageMock.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(["session-1", "session-2"]),
      );
      unarchiveSession("session-1");

      const stored = localStorageMock.getItem(LOCAL_STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed).not.toContain("session-1");
      expect(parsed).toContain("session-2");
    });

    it("should do nothing if session ID does not exist", () => {
      localStorageMock.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(["session-1"]),
      );
      unarchiveSession("non-existent");

      const stored = localStorageMock.getItem(LOCAL_STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(["session-1"]);
    });
  });

  describe("isSessionArchived", () => {
    it("should return true if session is archived", () => {
      localStorageMock.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(["session-1"]),
      );
      expect(isSessionArchived("session-1")).toBe(true);
    });

    it("should return false if session is not archived", () => {
      expect(isSessionArchived("session-1")).toBe(false);
    });
  });
});
