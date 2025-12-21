import {
  getTemplates,
  saveTemplate,
  deleteTemplate,
  // getTemplate, // Removed as it's unused
} from "./templates";
import { SessionTemplate } from "@/types/jules";

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

// Mock crypto
const randomUUIDMock = jest.fn();
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: randomUUIDMock,
  },
  writable: true,
});

describe("Templates Utility", () => {
  const TEMPLATES_KEY = "jules-session-templates";

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
    // @ts-expect-error: Deleting global properties for cleanup
    delete global.crypto;
  });

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    randomUUIDMock.mockReturnValue("test-uuid");
  });

  describe("getTemplates", () => {
    it("should return prebuilt templates when localStorage is empty", () => {
      const templates = getTemplates();
      expect(templates.length).toBeGreaterThan(4);
      expect(templates.some((t) => t.id === "bolt-performance-agent")).toBe(
        true,
      );
      expect(templates.some((t) => t.id === "palette-ux-agent")).toBe(true);
      expect(templates.some((t) => t.id === "sentinel-security-agent")).toBe(
        true,
      );
      expect(templates.some((t) => t.id === "guardian-test-agent")).toBe(true);
      expect(templates.some((t) => t.id === "echo-reproduction-agent")).toBe(
        true,
      );
    });

    it("should return parsed templates sorted by updatedAt desc", () => {
      const t1 = {
        id: "1",
        name: "T1",
        updatedAt: "2023-01-01T00:00:00Z",
      } as SessionTemplate;
      const t2 = {
        id: "2",
        name: "T2",
        updatedAt: "2023-01-02T00:00:00Z",
      } as SessionTemplate;

      localStorageMock.setItem(TEMPLATES_KEY, JSON.stringify([t1, t2]));

      const templates = getTemplates();
      expect(templates).toHaveLength(2);
      expect(templates[0].id).toBe("2"); // Most recent first
      expect(templates[1].id).toBe("1");
    });
  });

  describe("saveTemplate", () => {
    it("should create new template and preserve prebuilt ones", () => {
      const input = {
        name: "New Template",
        description: "Desc",
        prompt: "Prompt",
        title: "Title",
      };

      const result = saveTemplate(input);

      expect(result).toMatchObject(input);
      expect(result.id).toBe("test-uuid");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      const stored = JSON.parse(localStorageMock.getItem(TEMPLATES_KEY)!);
      // Should have at least 6: Bolt + Palette + Sentinel + Guardian + Echo + New
      expect(stored.length).toBeGreaterThan(5);
      expect(stored).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "test-uuid" }),
          expect.objectContaining({ id: "bolt-performance-agent" }),
          expect.objectContaining({ id: "palette-ux-agent" }),
          expect.objectContaining({ id: "sentinel-security-agent" }),
          expect.objectContaining({ id: "guardian-test-agent" }),
          expect.objectContaining({ id: "echo-reproduction-agent" }),
        ]),
      );
    });

    it("should update existing template", () => {
      const existing = {
        id: "existing-id",
        name: "Old Name",
        description: "Old Desc",
        prompt: "Old Prompt",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      } as SessionTemplate;

      localStorageMock.setItem(TEMPLATES_KEY, JSON.stringify([existing]));

      const update = {
        id: "existing-id",
        name: "New Name",
        description: "New Desc",
        prompt: "New Prompt",
      };

      const result = saveTemplate(update);

      expect(result.id).toBe("existing-id");
      expect(result.name).toBe("New Name");
      expect(result.updatedAt).not.toBe("2023-01-01T00:00:00Z"); // Should update time

      const stored = JSON.parse(localStorageMock.getItem(TEMPLATES_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe("New Name");
    });
  });

  describe("deleteTemplate", () => {
    it("should delete template by id", () => {
      const t1 = { id: "1", name: "T1" } as SessionTemplate;
      const t2 = { id: "2", name: "T2" } as SessionTemplate;
      localStorageMock.setItem(TEMPLATES_KEY, JSON.stringify([t1, t2]));

      deleteTemplate("1");

      const stored = JSON.parse(localStorageMock.getItem(TEMPLATES_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe("2");
    });
  });
});
