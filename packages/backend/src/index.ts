import { formatDate } from "@rw/utils";

const port = Number(process.env.PORT) || 3001;

const pgUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

Bun.serve({
  port,
  routes: {
    "/api/health": new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }),

    "/api/time": () => {
      return Response.json(
        {
          date: formatDate(new Date()),
          timestamp: Date.now(),
        },
        { headers: corsHeaders }
      );
    },

    "/api/status": async () => {
      const [postgres, redis] = await Promise.all([
        checkPostgres(),
        checkRedis(),
      ]);
      return Response.json({ postgres, redis }, { headers: corsHeaders });
    },

    "/api/railway-variables": () => {
      try {
        // Get all environment variables
        const env = process.env;
        
        // Filter variables that start with 'RAILWAY_'
        const railwayVars: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(env)) {
          if (key.startsWith("RAILWAY_")) {
            railwayVars[key] = value ?? "";
          }
        }
        
        return Response.json(
          {
            success: true,
            count: Object.keys(railwayVars).length,
            variables: railwayVars,
          },
          { headers: corsHeaders }
        );
      } catch (error: any) {
        console.error("Error fetching Railway variables:", error);
        return Response.json(
          {
            success: false,
            error: "Failed to fetch Railway environment variables",
            message: error?.message ?? "Unknown error",
          },
          { status: 500, headers: corsHeaders }
        );
      }
    },
  },

  fetch(req) {
    // Handle OPTIONS requests for CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    return new Response("Not Found", { 
      status: 404,
      headers: corsHeaders,
    });
  },
});

console.log(`Backend running on http://localhost:${port}`);
