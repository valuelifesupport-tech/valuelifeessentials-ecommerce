# ValueLife Essentials — Environment Variables Guide

This document describes all environment variables used by the Storefront, Admin Panel, and API Server.

---

## 1. Storefront (`src/` / Root `.env`)

Variables must be prefixed with `VITE_` to be bundled by Vite into browser code.

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_API_URL` | No | Auto-detect | Full URL to backend API. In local dev, leave blank to use Vite proxy. In production, e.g. `https://backend.valuelifeessentials.com`. |
| `VITE_STOREFRONT_URL` | No | Auto-detect | Public storefront URL (e.g. `https://valuelifeessentials.com`). |
| `VITE_ADMIN_URL` | No | `https://admin.valuelifeessentials.com` | URL of the Admin dashboard. |
| `VITE_APP_NAME` | No | `ValueLife Essentials` | Display name for the brand. |
| `VITE_DEFAULT_CURRENCY` | No | `INR` | Default storefront currency. |

---

## 2. Admin Portal (`admin/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_API_URL` | Yes | `https://backend.valuelifeessentials.com` | Backend API endpoint URL. |
| `VITE_STOREFRONT_URL` | No | `https://valuelifeessentials.com` | Storefront link for previewing products. |

---

## 3. API Backend (`server/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5000` | Port for Express server to listen on. |
| `NODE_ENV` | No | `production` | Environment mode (`production` or `development`). |
| `FRONTEND_URL` | No | `https://valuelifeessentials.com` | Origin allowed for CORS requests. |
| `ALLOWED_ORIGINS` | No | Local & prod hosts | Comma-separated list of allowed CORS domains. |
| **Database** | | | |
| `DB_TYPE` | No | `mysql` | Database engine (`mysql` or `sqlite`). |
| `MYSQL_HOST` | Yes* | `127.0.0.1` | MySQL database host (*when `DB_TYPE=mysql`). |
| `MYSQL_PORT` | No | `3306` | MySQL port. |
| `MYSQL_USER` | Yes* | — | MySQL database username. |
| `MYSQL_PASSWORD` | Yes* | — | MySQL database user password. |
| `MYSQL_DATABASE` | Yes* | — | MySQL database name. |
| **Authentication** | | | |
| `ADMIN_SECRET_KEY` | Yes | — | Secret key used to sign Admin JWT tokens. |
| `ADMIN_PASSWORD` | Yes | — | Password for the root master admin login. |
| `PASSWORD_SALT` | Yes | — | Salt used for customer password hashing. |
| `CUSTOMER_JWT_SECRET`| Yes | — | Secret key for signing customer authentication tokens. |
| `MAINTENANCE_PASSWORD`| No | — | Bypass PIN for maintenance mode gatekeeper. |
| **Razorpay Payments**| | | |
| `RAZORPAY_KEY_ID` | Yes | — | Razorpay Public Key ID. |
| `RAZORPAY_KEY_SECRET` | Yes | — | Razorpay Private Key Secret. |
| `RAZORPAY_WEBHOOK_SECRET` | No | — | Secret for verifying Razorpay webhooks. |
| **Email / SMTP** | | | |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP host. |
| `SMTP_PORT` | No | `465` | SMTP port (465 SSL, 587 TLS). |
| `SMTP_USER` | Yes | — | SMTP account username (e.g. `valuelifesupport@gmail.com`). |
| `SMTP_PASS` | Yes | — | 16-character Google App Password or SMTP password. |
| `SMTP_FROM_NAME` | No | `ValueLife Essentials`| Sender display name. |
| `SMTP_FROM_EMAIL`| No | `SMTP_USER` | Sender email address. |
| **Logistics** | | | |
| `SHIPROCKET_EMAIL` | No | — | Shiprocket account login email. |
| `SHIPROCKET_API_KEY`| No | — | Shiprocket API authentication key. |
