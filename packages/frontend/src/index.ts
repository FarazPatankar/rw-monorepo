import homepage from "./index.html";

const port = Number(process.env.PORT) || 3000;

/**
 * BACKEND_URL defaults to the backend's Railway private network address.
 * Locally, override with BACKEND_URL=http://localhost:3001
 */
const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend.railway.internal:3001";

Bun.serve({
  port,
  routes: {
    "/": homepage,

    // Proxy API calls to the backend service
    "/api/*": async (req) => {
      const url = new URL(req.url);
      const target = `${BACKEND_URL}${url.pathname}${url.search}`;
      return fetch(target, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    },
  },

  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Frontend running on http://localhost:${port}`);
