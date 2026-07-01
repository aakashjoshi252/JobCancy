# JewelCancy Frontend

React and Vite frontend for JewelCancy.

## Local Setup

```bash
cd client
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies API calls to the backend on `http://localhost:3000`.

## Environment

Create `client/.env` with:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_SUPPORT_EMAIL=support@jewelcancy.com
VITE_DEBUG_MODE=true
```

## Build

```bash
npm run build
```

Deploy the generated `dist` folder as a Render static site, Vercel site, Netlify site, or Hostinger static build.
