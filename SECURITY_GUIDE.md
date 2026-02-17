# E-Gaming Security Guide

## Implemented Security Features

### 1. Email verification (OTP)
- **Register**: 6-digit code sent to email; user must verify before full access
- **Login**: If email not verified, code is re-sent; verify via `/auth/verify-login`
- **Password reset**: Code sent to email; verify at `/auth/reset-password`
- Codes expire in **10 minutes**

### 2. Account lockout
- **5 failed login attempts** → account locked for **15 minutes**
- Lockout resets on successful login or password reset

### 3. Rate limiting
- **Auth endpoints**: 10 requests per minute per IP
- **Global**: 100 requests per minute per IP

### 4. Refresh tokens
- Access token: **15 minutes**
- Refresh token: **7 days** (stored hashed in DB)
- Use `POST /auth/refresh` with `{ "refreshToken": "..." }` to get new tokens

### 5. Security headers
- **Helmet** middleware enabled (XSS, clickjacking, etc.)

### 6. Password strength
- Min 8 characters
- Must include uppercase, lowercase, and number
- Hashed with bcrypt (12 rounds)

---

## SMTP setup (required for production)

Add to `backend/.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
MAIL_FROM="E-Gaming <noreply@yourdomain.com>"
APP_NAME=E-Gaming
```

### Popular SMTP providers
| Provider | Use case |
|----------|----------|
| **Resend** | Simple API, free tier |
| **SendGrid** | 100 emails/day free |
| **Mailgun** | 5000/month free (3 months) |
| **Gmail** | App password (less reliable for prod) |
| **Brevo (Sendinblue)** | 300 emails/day free |

**Without SMTP**: Codes are logged to the console (dev only).

---

## Auth flow

### New user registration
1. `POST /auth/register` → Code sent to email
2. `POST /auth/verify-email` with `{ email, code }` → Returns tokens

### Login (verified user)
1. `POST /auth/login` → Returns tokens directly

### Login (unverified user)
1. `POST /auth/login` → Returns `{ requiresVerification: true, email }`
2. `POST /auth/verify-login` with `{ email, code }` → Returns tokens

### Password reset
1. `POST /auth/request-password-reset` with `{ email }`
2. User receives code via email
3. `POST /auth/reset-password` with `{ email, code, newPassword }`

### Token refresh
```
POST /auth/refresh
Body: { "refreshToken": "..." }
```

---

## API summary

| Endpoint | Auth | Description |
|----------|------|-------------|
| POST /auth/register | Public | Register, sends verification code |
| POST /auth/verify-email | Public | Verify email with code |
| POST /auth/login | Public | Login (may require verify-login) |
| POST /auth/verify-login | Public | Complete login with code |
| POST /auth/request-password-reset | Public | Request reset code |
| POST /auth/reset-password | Public | Reset with code |
| POST /auth/refresh | Public | Refresh tokens |
| GET /auth/me | JWT | Current user |
