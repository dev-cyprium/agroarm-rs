# R2 AccessDenied Troubleshooting

If you get `AccessDenied` (403) when uploading media to R2, check the following:

## 1. Endpoint matches bucket jurisdiction

**Critical:** Your bucket's jurisdiction must match the endpoint:

| Bucket jurisdiction | Endpoint format |
|---------------------|-----------------|
| Default             | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| EU                  | `https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com` |

**To check:** In Cloudflare Dashboard → R2 → Your bucket → Settings. Look at "Data location" or where the bucket was created.

**If you're getting 403:** Try the *other* endpoint format. A common mistake is using the EU endpoint for a default-jurisdiction bucket, or vice versa.

## 2. API token permissions

The token must be created from **R2 → Manage R2 API Tokens** (not the general Cloudflare API tokens).

- **Permission:** Object Read & Write (minimum for uploads)
- **Scope:** "Apply to specific buckets only" → select `agroarm-media` (or your bucket name)

## 3. Bucket name

`R2_BUCKET` must match the bucket name **exactly** (case-sensitive). In R2 dashboard, the bucket is listed under "Buckets".

## 4. Verify credentials with rclone

```bash
# Install rclone, then configure:
rclone config
# Choose: s3, leave blank for env auth, use your R2 credentials
# Endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com (or .eu. for EU)
# Test: rclone lsd r2:
```

## 5. Quick endpoint test

If using EU endpoint and getting 403, try the default endpoint in `.env`:

```
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

(Remove `.eu` from the hostname)
