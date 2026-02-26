import type { Hono } from "hono";
import { app as defaultApp, createApp } from "../../src/app.js";

export function getTestApp(): Hono {
  return defaultApp;
}

export function createIsolatedTestApp(): Hono {
  return createApp();
}

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
