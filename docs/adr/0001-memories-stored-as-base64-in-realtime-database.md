---
status: accepted
date: 2026-09-15
---

# Memories are stored as base64 strings inside the City record

The project must stay on Firebase's no-cost Spark plan, and since February 2026 Cloud Storage for Firebase requires the Blaze plan for every bucket, so photos cannot go to object storage. We keep each Memory as a browser-resized JPEG (800px max, quality 0.75, roughly 100 KB) encoded as a base64 data URI, stored as a child of the City record under `memories/`, capped at five per City. Expected scale is about three Accounts with twenty Cities each, so a full list load is well under 20 MB against a 10 GB/month download quota.

## Considered options

- **Separate `memories/{cityId}` node** loaded only on City detail, keeping the list subscription light. Rejected: at this scale the saving is irrelevant and it doubles the read paths and rules.
- **Cloud Storage for Firebase**. Rejected: not available on Spark since 2026-02-03.
- **Third-party free image host** (Cloudinary, Imgur, etc.). Rejected: adds a second account, key, and failure mode to a hobby app.

## Consequences

- The existing single `image` field on a City is read as the first Memory; new writes go to `memories/`.
- If the user base grows past a few dozen accounts, revisit: move Memories to a separate node first, then consider Blaze with its no-cost Storage quota.
