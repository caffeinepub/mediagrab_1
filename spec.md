# MediaGrab

## Current State
- React frontend + Motoko backend with HTTP outcalls component
- Frontend calls cobalt.tools API directly from browser (CORS blocked)
- Backend has resolveMedia function but calls the source URL directly instead of cobalt.tools API
- User sees "Network blocked in browser" error

## Requested Changes (Diff)

### Add
- Backend proxy: backend calls cobalt.tools API via HTTP outcall and returns download links to frontend

### Modify
- Backend `resolveMedia`: make proper POST request to cobalt.tools API (`https://co.wuk.sh/api/json`) with correct headers and JSON body, parse response for download URLs
- Frontend `MediaDownloader`: replace direct cobalt.tools fetch with backend `resolveMedia` call

### Remove
- Direct browser-to-cobalt.tools fetch in frontend (causes CORS block)

## Implementation Plan
1. Update `main.mo` to POST to cobalt.tools API (`https://co.wuk.sh/api/json`) with correct JSON body and headers, parse the response JSON for url/picker fields
2. Update `MediaDownloader.tsx` to call `backend.resolveMedia(url)` instead of direct fetch
3. Map backend `MediaResult` type to frontend `MediaResult` type for ResultCard
