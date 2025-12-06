# Manual Requirements

Tasks that need to be completed manually before deployment.

---

## VAPID Keys for Push Notifications

The Real-Time Earthquake Alert system requires VAPID keys for Web Push notifications.

### Generate Keys

Run this command in terminal:

```bash
npx web-push generate-vapid-keys
```

### Add to Environment Variables

Add the generated keys to your `.env` file (and Vercel environment variables):

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
VAPID_SUBJECT=mailto:alerts@quakewise.com
```

**Notes:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Needed client-side for push subscription
- `VAPID_PRIVATE_KEY` - Server-side only, never expose publicly
- `VAPID_SUBJECT` - Your contact email or website URL

---

## Cron Secret (Optional)

For manual testing of the earthquake polling endpoint:

```env
CRON_SECRET=<random-secure-string>
```

This allows you to manually trigger `/api/alerts/cron/poll-earthquakes` for testing.

---

## Vercel Cron Job

The cron job is configured in `vercel.json` to run every minute:

```json
"crons": [
  {
    "path": "/api/alerts/cron/poll-earthquakes",
    "schedule": "* * * * *"
  }
]
```

This is automatically active on Vercel Pro/Enterprise plans. On Hobby plan, crons run at most once per day.

---

## Email Alert Templates (Pending)

Email templates for critical earthquake alerts (M5.0+) still need to be implemented. This requires:
- Email service integration (e.g., Resend, SendGrid)
- HTML email templates for alerts
