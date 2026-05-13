# Deploy to Vercel — Step by Step

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: The PlayGround v1.0"
gh repo create playground --public --source=. --push
```

## 2. Import to Vercel

1. Go to vercel.com → **Add New → Project**
2. Import your `playground` GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Add these **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://owaoskmdzrtuonuddmha.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key (from Supabase → Settings → API) |
| `GM_EMAILS` | comma-separated GM emails e.g. `you@email.com` |

5. Click **Deploy**

## 3. Add Production URL to Supabase

In Supabase → **Project Settings → URL Configuration**:
- Site URL: `https://playground.teambuddy.my`
- Add redirect URL: `https://playground.teambuddy.my/**`

## 4. Custom Domain (playground.teambuddy.my)

In Vercel → **Project → Settings → Domains**, add `playground.teambuddy.my`.

Then add these DNS records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| `CNAME` | `playground` | `cname.vercel-dns.com` |

Or if using Cloudflare (recommended, proxied off for Vercel):
| Type | Name | Value | Proxy |
|------|------|-------|-------|
| `CNAME` | `playground` | `cname.vercel-dns.com` | DNS only (grey cloud) |

Vercel will auto-issue an SSL certificate within ~60 seconds.

## 5. Create Supabase Storage Bucket

In Supabase → **Storage → New Bucket**:
- Name: `submissions`
- Public: ✅ Yes
- Max file size: 50 MB
- Allowed MIME types: `image/*`

## 6. Seed the Database

```bash
# Make sure .env.local has SUPABASE_SERVICE_ROLE_KEY filled in
npx tsx scripts/seed-event.ts
```

This creates 1 live event + 25 teams with 6-char login codes. Prints all codes to terminal.

## 7. Run a Dry-Run

1. Open the app on your phone
2. Enter any team code from the seed output
3. Complete 2–3 missions in Beach Street
4. Enter the passcode `1847` to unlock Armenian Street
5. Check `/admin` with your GM email

## 8. Go Live

Hand printed login codes (one per team envelope) to each team.
Post zone passcodes on printed A3 posters at each zone checkpoint.
