# Upload Performance Guide

## Nginx (production)

Apply on the server/location that proxies to NestJS:

```nginx
client_max_body_size 4000M;
client_body_timeout 300s;

location /api/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_http_version 1.1;

    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    # Stream request body to upstream instead of buffering full file first.
    proxy_request_buffering off;
    proxy_buffering off;
}
```

Why it helps:
- `proxy_request_buffering off` starts forwarding upload bytes to Nest immediately.
- `proxy_buffering off` reduces response-side buffering latency.
- Longer timeouts prevent slow uplinks from being cut off.

## Chunk Upload Example (optional)

If uploads are still slow/unreliable for very large files, use chunking with 5-10MB chunks.

### Browser example

```ts
export async function uploadInChunks(
  file: File,
  uploadId: string,
  chunkSize = 8 * 1024 * 1024
) {
  const totalChunks = Math.ceil(file.size / chunkSize);
  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("uploadId", uploadId);
    formData.append("index", String(index));
    formData.append("totalChunks", String(totalChunks));
    await fetch("/api/uploads/chunk", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  }
  await fetch("/api/uploads/complete", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
  });
}
```

### NestJS endpoint shape

```ts
// POST /uploads/chunk:
// - write each chunk to /uploads/tmp/{uploadId}/{index}.part
// POST /uploads/complete:
// - append chunks in order to final file and remove temp folder
```

## Best long-term architecture: direct-to-storage uploads

For highest throughput, bypass your Nest instance for large media:
- backend creates short-lived signed upload URL/token
- browser uploads file directly to storage (S3/Supabase)
- backend stores only resulting path/URL in DB

This removes API server CPU and network bottlenecks for large uploads.
