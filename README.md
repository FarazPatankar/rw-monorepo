# rw-monorepo

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.3. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## API Endpoints

### Backend Service

The backend service runs on port 3001 by default and provides the following endpoints:

#### `/api/health`
Health check endpoint that returns a simple status.

**Response:**
```json
{
  "status": "ok"
}
```

#### `/api/time`
Returns the current server time in formatted and timestamp formats.

**Response:**
```json
{
  "date": "2024-01-15",
  "timestamp": 1705334400000
}
```

#### `/api/status`
Checks the connectivity status of PostgreSQL and Redis databases.

**Response:**
```json
{
  "postgres": {
    "connected": true,
    "version": "PostgreSQL 15.3",
    "serverTime": "2024-01-15T12:00:00.000Z"
  },
  "redis": {
    "connected": true,
    "version": "7.0.11",
    "lastPing": "pong:1705334400000"
  }
}
```

#### `/api/egress-check`
Tests external connectivity by making a request to a specified URL and measuring the latency.

**Query Parameters:**
- `url` (optional): The external URL to test. Defaults to `https://httpbin.org/get`
- `timeout` (optional): Request timeout in milliseconds (100-30000). Defaults to 10000ms

**Example Requests:**
```bash
# Test default endpoint
curl http://localhost:3001/api/egress-check

# Test specific URL
curl "http://localhost:3001/api/egress-check?url=https://api.github.com"

# Test with custom timeout
curl "http://localhost:3001/api/egress-check?url=https://example.com&timeout=5000"
```

**Success Response (200):**
```json
{
  "success": true,
  "status": 200,
  "statusText": "OK",
  "duration": 145,
  "url": "https://httpbin.org/get"
}
```

**Failure Response (503):**
```json
{
  "success": false,
  "error": "Request timed out after 10000ms",
  "errorType": "TIMEOUT",
  "duration": 10002,
  "url": "https://slow-endpoint.example.com"
}
```

**Error Types:**
- `TIMEOUT`: Request exceeded the specified timeout
- `NETWORK_ERROR`: Network connection failed
- `DNS_ERROR`: DNS resolution failed
- `UNKNOWN_ERROR`: Other errors

**Validation Errors (400):**
```json
{
  "error": "Invalid URL provided"
}
```
```json
{
  "error": "Timeout must be between 100 and 30000 milliseconds"
}
```
