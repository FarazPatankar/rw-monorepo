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

async function getPostgresTables() {
  if (!pgUrl) return { error: "DATABASE_URL not set" };
  try {
    const sql = Bun.sql;
    const rows = await sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' 
      AND schemaname != 'information_schema'
      ORDER BY tablename
    `;
    return { tables: rows.map((row: any) => row.tablename) };
  } catch (e: any) {
    return { error: e.message };
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

    "/api/postgres/tables": async () => {
      const result = await getPostgresTables();
      return Response.json(result);
    },
  },

  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Backend running on http://localhost:${port}`);
