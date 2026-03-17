import { formatDate } from "@rw/utils";

const port = Number(process.env.PORT) || 3001;

const pgUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

async function checkPostgres() {
  if (!pgUrl) return { connected: false, error: "DATABASE_URL not set" };
  try {
    const sql = Bun.sql;
    const [row] = await sql`SELECT version(), now() as server_time`;
    return {
      connected: true,
      version: row.version.split(" ").slice(0, 2).join(" "),
      serverTime: row.server_time,
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}

async function checkRedis() {
  if (!redisUrl) return { connected: false, error: "REDIS_URL not set" };
  try {
    const redis = new Bun.RedisClient(redisUrl);
    await redis.set("rw:ping", `pong:${Date.now()}`);
    const value = await redis.get("rw:ping");
    const info = await redis.send("INFO", ["server"]);
    const versionMatch = String(info).match(/redis_version:(\S+)/);
    return {
      connected: true,
      version: versionMatch?.[1] ?? "unknown",
      lastPing: value,
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}

function getRailwayVariables() {
  const railwayVars: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("RAILWAY_")) {
      railwayVars[key] = value || "";
    }
  }
  
  return railwayVars;
}

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

    "/api/status": async () => {
      const [postgres, redis] = await Promise.all([
        checkPostgres(),
        checkRedis(),
      ]);
      return Response.json({ postgres, redis });
    },

    "/api/railway-variables": () => {
      try {
        const variables = getRailwayVariables();
        return Response.json(variables);
      } catch (error) {
        console.error("Error fetching Railway variables:", error);
        return Response.json(
          { error: "Failed to fetch Railway variables" },
          { status: 500 }
        );
      }
    },
  },

  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Backend running on http://localhost:${port}`);
