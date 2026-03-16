import { test, expect } from "bun:test";
import { formatDate, createApiUrl, invariant } from "./index.ts";

test("formatDate returns YYYY-MM-DD", () => {
  const date = new Date("2026-03-16T12:00:00Z");
  expect(formatDate(date)).toBe("2026-03-16");
});

test("createApiUrl builds URL with params", () => {
  const url = createApiUrl("http://backend.railway.internal:3000", "/api/users", {
    page: "1",
  });
  expect(url).toBe("http://backend.railway.internal:3000/api/users?page=1");
});

test("invariant throws on falsy", () => {
  expect(() => invariant(false, "nope")).toThrow("Invariant violation: nope");
});

test("invariant passes on truthy", () => {
  expect(() => invariant(true, "ok")).not.toThrow();
});
