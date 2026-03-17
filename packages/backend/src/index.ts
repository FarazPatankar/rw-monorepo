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

async function checkExternalRequest(url: string, timeoutMs: number = 10000) {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Railway-Egress-Check/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    return {
      success: response.ok,
      duration,
      statusCode: response.status,
      ...(response.ok ? {} : { error: `HTTP ${response.status}: ${response.statusText}` }),
    };
  } catch (e: any) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    let errorMessage = e.message;
    if (e.name === 'AbortError') {
      errorMessage = `Request timeout after ${timeoutMs}ms`;
    } else if (e.code === 'ENOTFOUND') {
      errorMessage = 'DNS lookup failed - host not found';
    } else if (e.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
    } else if (e.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout';
    }
    
    return {
      success: false,
      duration,
      error: errorMessage,
    };
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

    "/api/egress-check": async (req) => {
      const url = new URL(req.url);
      const targetUrl = url.searchParams.get("url") || "https://www.google.com";
      const timeout = parseInt(url.searchParams.get("timeout") || "10000", 10);
      
      // Validate URL
      try {
        new URL(targetUrl);
      } catch {
        return Response.json(
          {
            success: false,
            duration: 0,
            error: "Invalid URL provided",
          },
          { status: 400 }
        );
      }
      
      const result = await checkExternalRequest(targetUrl, timeout);
      return Response.json(result);
    },
  },

  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Backend running on http://localhost:${port}`);
