# QuakeWise API - Quick Reference Card

## 🌐 Production URLs

**Domain**: https://quakewise.com

### Public Endpoints (No Auth Required)
```
📖 Interactive Docs:  https://quakewise.com/api-docs
❤️ Health Check:      https://quakewise.com/api/v1/status
📋 Parameters:        https://quakewise.com/api/v1/parameters
📄 OpenAPI Spec:      https://quakewise.com/api-docs/openapi.json
```

### Authenticated Endpoints
```
🔑 Issue Token:       POST https://quakewise.com/api/v1/auth/issue-token
✅ Verify Token:      POST https://quakewise.com/api/v1/auth/verify-token
🏢 Assessment:        POST https://quakewise.com/api/v1/assessment/complete
📊 Usage Stats:       GET  https://quakewise.com/api/v1/usage/{appId}
```

### Admin Endpoint
```
⚙️ Register App:      POST https://quakewise.com/api/admin/register-app
```

---

## 🔑 Authentication

### Platform Token (Static)
```http
X-Platform-Token: <your-platform-token>
```
- Identifies your application
- Generated during app registration
- Never expires (until rotated)

### JWT Token (User-Specific)
```http
Authorization: Bearer <jwt-token>
```
- Issued per user session
- Expires after 7 days (default)
- Get from `/auth/issue-token`

---

## 📝 Quick Examples

### 1. Health Check (No Auth)
```bash
curl https://quakewise.com/api/v1/status
```

### 2. Get Valid Parameters (No Auth)
```bash
curl https://quakewise.com/api/v1/parameters
```

### 3. Register App (Admin)
```bash
curl -X POST https://quakewise.com/api/admin/register-app \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \
  -d '{
    "appId": "my-app",
    "name": "My Application",
    "tier": "pro"
  }'
```

### 4. Issue User Token
```bash
curl -X POST https://quakewise.com/api/v1/auth/issue-token \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN" \
  -d '{
    "userId": "user_123",
    "appId": "my-app",
    "tier": "pro"
  }'
```

### 5. Verify Token
```bash
curl -X POST https://quakewise.com/api/v1/auth/verify-token \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN" \
  -d '{"token": "YOUR_JWT_TOKEN"}'
```

### 6. Building Assessment
```bash
curl -X POST https://quakewise.com/api/v1/assessment/complete \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "location": {
      "latitude": 41.0082,
      "longitude": 28.9784
    },
    "building": {
      "structuralSystem": "C2",
      "numberOfStories": 5,
      "yearOfConstruction": 2010,
      "designRegulation": "2007-2018"
    }
  }'
```

### 7. Check Usage
```bash
curl https://quakewise.com/api/v1/usage/my-app?days=7 \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN"
```

---

## 📊 Rate Limits

| Tier       | Requests/Hour | Requests/Day |
|------------|---------------|--------------|
| Free       | 100           | 1,000        |
| Pro        | 1,000         | 10,000       |
| Enterprise | 10,000        | 100,000      |

**Rate Limit Headers (in response):**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 2025-09-15T11:00:00Z
X-RateLimit-Tier: pro
```

---

## 🏗️ Building Structural Codes

### Concrete
- `C1` - Concrete Moment Frame
- `C2` - Concrete Shear Walls
- `C3` - Concrete Frame with URM

### Steel
- `S1` - Steel Moment Frame
- `S2` - Steel Braced Frame
- `S3` - Steel Light Frame
- `S4` - Steel with Concrete Shear Walls
- `S5` - Steel with URM

### Wood
- `W1` - Wood Light Frame
- `W2` - Wood Commercial

### Masonry
- `RM1` - Reinforced Masonry
- `RM2` - Reinforced Masonry with Precast
- `URM` - Unreinforced Masonry

### Other
- `PC1` - Precast Tilt-Up
- `PC2` - Precast Frames
- `MH` - Mobile Homes

---

## 🌍 Seismic Zones

- `Zone 1` - Low (PGA < 0.10g)
- `Zone 2` - Moderate (PGA 0.10-0.20g)
- `Zone 3` - High (PGA 0.20-0.30g)
- `Zone 4` - Very High (PGA > 0.30g)

---

## 🪨 Soil Types

- `ZA` - Hard Rock (Vs30 > 1500 m/s)
- `ZB` - Rock (760-1500 m/s)
- `ZC` - Dense Soil (360-760 m/s) - Default
- `ZD` - Stiff Soil (180-360 m/s)
- `ZE` - Soft Soil (< 180 m/s)

---

## 📅 Design Regulations

- `Before 1975` - Pre-modern codes
- `1975-1998` - Early seismic standards
- `1998-2007` - Improved provisions
- `2007-2018` - Modern Turkish code
- `After 2018 (TBDY)` - Current TBDY-2018

---

## ⚠️ Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_PLATFORM_TOKEN` | 401 | Platform auth failed |
| `INVALID_JWT_TOKEN` | 401 | JWT invalid/missing |
| `JWT_TOKEN_EXPIRED` | 401 | JWT expired |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid request |
| `SERVICE_ERROR` | 500 | Internal error |

---

## 🔧 npm Scripts

```bash
npm run api:prod-tokens    # Generate production tokens
npm run api:register       # Register app locally
npm run api:test <token>   # Test API endpoints
npm run dev                # Start dev server
```

---

## 📚 Documentation Files

- `DEPLOY_TO_PRODUCTION.md` - Complete deployment guide
- `QUICK_START.md` - 5-minute local setup
- `API_README.md` - Full API documentation
- `PRODUCTION_DEPLOYMENT.md` - Production details

---

## 💡 Tips

### JavaScript Integration
```javascript
const API_BASE = 'https://quakewise.com/api/v1';
const PLATFORM_TOKEN = 'your_token';

async function getUserToken(userId) {
  const res = await fetch(`${API_BASE}/auth/issue-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Platform-Token': PLATFORM_TOKEN
    },
    body: JSON.stringify({ userId, appId: 'my-app', tier: 'pro' })
  });
  return (await res.json()).data.token;
}
```

### Python Integration
```python
import requests

API_BASE = 'https://quakewise.com/api/v1'
PLATFORM_TOKEN = 'your_token'

def get_user_token(user_id):
    response = requests.post(
        f'{API_BASE}/auth/issue-token',
        headers={'X-Platform-Token': PLATFORM_TOKEN},
        json={'userId': user_id, 'appId': 'my-app', 'tier': 'pro'}
    )
    return response.json()['data']['token']
```

---

## 📞 Support

- **Documentation**: https://quakewise.com/api-docs
- **Repository**: github.com/arianbod/nextjs-fs-earthquake
- **Branch**: underDev,RLS1.1

---

**🎯 Quick Access**: Bookmark this page for fast reference!
