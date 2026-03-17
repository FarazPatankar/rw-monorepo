# Backend Service

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns basic health status

### Time
- **GET** `/api/time`
- Returns formatted date and timestamp

### Status
- **GET** `/api/status`
- Returns connection status for PostgreSQL and Redis

### Egress Connectivity Check
- **GET** `/api/egress-check`
- Tests external network connectivity and measures latency

#### Query Parameters
- `url` (optional): The external URL to test. Defaults to `https://httpbin.org/get`
- `timeout` (optional): Request timeout in milliseconds (100-30000). Defaults to `10000`

#### Response Format

**Success Response:**
```json
{
  "success": true,
  "status": 200,
  "statusText": "OK",
  "duration": 245,
  "url": "https://httpbin.org/get"
}
```

**Failure Response:**
```json
{
  "success": false,
  "error": "Request timeout after 10000ms",
  "errorCode": "ETIMEDOUT",
  "duration": 10003,
  "url": "https://example.com"
}
```

#### Examples

Test default endpoint (httpbin.org):
```bash
curl http://localhost:3001/api/egress-check
```

Test custom URL:
```bash
curl "http://localhost:3001/api/egress-check?url=https://api.github.com"
```

Test with custom timeout:
```bash
curl "http://localhost:3001/api/egress-check?url=https://httpbin.org/delay/5&timeout=3000"
```

#### Error Handling

The endpoint handles various network errors:
- **Timeout**: Request exceeds the specified timeout
- **DNS Resolution**: Host not found (ENOTFOUND)
- **Connection Refused**: Target server refused connection (ECONNREFUSED)
- **Connection Timeout**: Network timeout (ETIMEDOUT)
- **Invalid URL**: Malformed URL provided (400 Bad Request)
- **Invalid Timeout**: Timeout outside valid range (400 Bad Request)
