import { beforeEach, describe, it, expect } from "vitest";
import { useAppStore } from "../store";

type PersistOptions = {
  name?: string;
  partialize?: (state: ReturnType<typeof useAppStore.getState>) => unknown;
  migrate?: (persistedState: unknown, version: number) => unknown;
};

type StoreWithPersist = typeof useAppStore & {
  persist?: {
    getOptions?: () => PersistOptions;
  };
};

function getPersistOptions(): PersistOptions | undefined {
  return (useAppStore as StoreWithPersist).persist?.getOptions?.();
}

describe("persist middleware — localStorage key", () => {
  it("uses the key finance-dashboard-store", () => {
    // Access the persist options via the store's persist API
    const persistOptions = getPersistOptions();
    expect(persistOptions?.name).toBe("finance-dashboard-store");
  });
});

describe("persist middleware — partialize", () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  it("partialize includes role", () => {
    const persistOptions = getPersistOptions();
    const partial = persistOptions?.partialize?.(useAppStore.getState());
    expect(partial).toHaveProperty("role");
  });

  it("partialize includes darkMode", () => {
    const persistOptions = getPersistOptions();
    const partial = persistOptions?.partialize?.(useAppStore.getState());
    expect(partial).toHaveProperty("darkMode");
  });

  it("partialize excludes transactions", () => {
    const persistOptions = getPersistOptions();
    const partial = persistOptions?.partialize?.(useAppStore.getState());
    expect(partial).not.toHaveProperty("transactions");
  });

  it("partialize excludes action functions", () => {
    const persistOptions = getPersistOptions();
    const partial = persistOptions?.partialize?.(useAppStore.getState());
    const hasFunction = Object.values(partial ?? {}).some(
      (v) => typeof v === "function",
    );
    expect(hasFunction).toBe(false);
  });
});

describe("persist middleware — migrate", () => {
  it("migrate from version 0 returns Viewer role and darkMode false", () => {
    const persistOptions = getPersistOptions();
    const result = persistOptions?.migrate?.({}, 0);
    expect(result).toEqual({ role: "Viewer", darkMode: false });
  });

  it("migrate from version 1 returns persisted state unchanged", () => {
    const persistOptions = getPersistOptions();
    const persisted = { role: "Admin", darkMode: true };
    const result = persistOptions?.migrate?.(persisted, 1);
    expect(result).toEqual(persisted);
  });
});
