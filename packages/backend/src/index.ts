import { formatDate } from "@rw/utils";

const port = Number(process.env.PORT) || 3001;

Bun.serve({
  port,
  routes: {
    "/api/health": new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" },
    }),

    "/api/time": () => {
      return Response.json({
        date: formatDate(new Date()),
        timestamp: Date.now(),
      });
    },
  },

  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Backend running on http://localhost:${port}`);
