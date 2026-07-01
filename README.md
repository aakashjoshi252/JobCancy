# JewelCancy

JewelCancy is a Node.js, Express, MongoDB, React, and Vite recruitment platform for the jewellery industry. It runs directly with Node.js and npm.

## Backend Setup

```bash
cd server
npm install
npm run dev
```

Backend development runs on `http://localhost:3000` by default.

Create `server/.env` with normal MongoDB, Cloudinary, Razorpay, SMTP, JWT, and CORS values:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/jewelcancy
# or: MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jewelcancy
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend development runs on `http://localhost:5173`.

Create `client/.env` with:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_SUPPORT_EMAIL=support@jewelcancy.com
VITE_DEBUG_MODE=true
```

## Production Deployment

- Render backend web service: root `server`, build `npm ci --omit=dev`, start `npm start`, health path `/health`.
- Render frontend static site: root `client`, build `npm ci && npm run build`, publish `dist`, rewrite `/* -> /index.html`.
- MongoDB Atlas: set `MONGODB_URI` to the Atlas connection string.
- Cloudinary: set media upload credentials in the backend environment.
- Razorpay: set backend secret keys and frontend public key.
- SMTP: set SMTP or supported email fallback credentials for verification and notifications.

## Useful Commands

```bash
cd server
npm run validate-env
npm run production-check
npm test
```

```bash
cd client
npm run build
```
