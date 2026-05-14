#!/usr/bin/env bash
# Run this once after: gh auth login
# Fill in values from your .env.local and Vercel dashboard

REPO="jol517603-beep/playground"

gh secret set VERCEL_TOKEN              --body "YOUR_VERCEL_TOKEN"        --repo "$REPO"
gh secret set VERCEL_ORG_ID            --body "YOUR_VERCEL_ORG_ID"       --repo "$REPO"
gh secret set VERCEL_PROJECT_ID        --body "YOUR_VERCEL_PROJECT_ID"   --repo "$REPO"
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "YOUR_SUPABASE_URL"        --repo "$REPO"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY  --body "YOUR_ANON_KEY"      --repo "$REPO"
gh secret set SUPABASE_SERVICE_ROLE_KEY      --body "YOUR_SERVICE_KEY"   --repo "$REPO"
gh secret set GM_EMAILS                --body "YOUR_GM_EMAILS"           --repo "$REPO"

echo "All 7 secrets set on $REPO"
