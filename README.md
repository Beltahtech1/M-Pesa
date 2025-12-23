# 🚀 M-Pesa STK Push Payment Gateway

A modern, production-ready M-Pesa STK Push payment gateway with a sleek frontend interface. This project enables seamless mobile money transactions through Safaricom's Daraja API with real-time payment status tracking.

![M-Pesa Payment Gateway](https://img.shields.io/badge/Node.js-18%2B-green) ![Express](https://img.shields.io/badge/Express-4.x-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- ✅ **STK Push Integration** – Initiate M-Pesa payments directly to user's phone
- ✅ **Real-time Status Tracking** – Poll transaction status with automatic updates
- ✅ **Modern UI/UX** – Sleek, responsive design with animated elements
- ✅ **Secure** – CORS protection, input validation, and environment variables
- ✅ **Production Ready** – Callback handling, error management, and logging
- ✅ **Multi-Origin Support** – Configure multiple frontend URLs
- ✅ **Transaction Storage** – In-memory store (can be replaced with database)

## 📁 Project Structure

```
silva-mpesa/
├── server.js          # Main Express server
├── mpesa.js          # M-Pesa API integration
├── public/
│   └── index.html    # Frontend interface
├── .env.example      # Environment variables template
├── package.json      # Dependencies
└── README.md         # This file
```

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js 18+ installed
- Safaricom Daraja API credentials
- Business PayBill number and passkey

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd silva-mpesa
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:

```env
# Daraja API Credentials
DARAJA_CONSUMER_KEY=your_consumer_key_from_daraja_portal
DARAJA_CONSUMER_SECRET=your_consumer_secret_from_daraja_portal
BUSINESS_SHORT_CODE=your_paybill_number
PASSKEY=your_safaricom_passkey

# API Configuration
CALLBACK_URL=https://your-backend-url.com/api/callback
MPESA_BASE_URL=https://api.safaricom.co.ke
PORT=3000
```

### 4. Update Frontend URLs
In `server.js`, modify the `allowedOrigins` array to include your frontend domains:

```javascript
const allowedOrigins = [
  "https://your-frontend-domain.com",
  "https://pay.silvatech.top",
  "http://localhost:3000" // For development
];
```

### 5. Update Frontend Endpoint
In `index.html`, update the fetch URLs to point to your backend:

```javascript
// Line 216: Update STK Push endpoint
const res = await fetch("https://your-backend-url.com/stkpush", {
  // ...
});

// Line 230: Update status check endpoint
const statusRes = await fetch(`https://your-backend-url.com/status/${checkoutID}`);
```

### 6. Run the Application
```bash
# Development
node server.js

# Production (with PM2 recommended)
pm2 start server.js --name "mpesa-gateway"
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stkpush` | Initiate STK Push payment |
| POST | `/api/callback` | M-Pesa callback URL (webhook) |
| GET | `/status/:id` | Check transaction status from store |
| GET | `/query/:id` | Query transaction directly from Safaricom |

### 🔹 STK Push Request
```json
POST /stkpush
{
  "phone": "254712345678",
  "amount": 100
}
```

### 🔹 STK Push Response
```json
{
  "message": "STK Push initiated",
  "checkoutRequestID": "ws_CO_19122024123456789",
  "response": { /* M-Pesa response */ }
}
```

### 🔹 Status Check
```json
GET /status/ws_CO_19122024123456789
```

## 🔒 Security Considerations

1. **Never commit `.env`** to version control
2. **Use HTTPS** in production for all endpoints
3. **Implement rate limiting** (consider using `express-rate-limit`)
4. **Replace in-memory storage** with a database (Redis/PostgreSQL)
5. **Add authentication middleware** for sensitive endpoints
6. **Validate all inputs** thoroughly

## 📦 Production Deployment

### 1. Database Integration (Recommended)
Replace the in-memory `transactions` object with a database:

```javascript
// Example using Redis
import redis from 'redis';
const client = redis.createClient();

// Store transaction
await client.set(`tx:${checkoutRequestID}`, JSON.stringify(transactionData));

// Retrieve transaction
const data = await client.get(`tx:${checkoutRequestID}`);
```

### 2. Environment Variables on Hosting
- **Render/Vercel/Heroku**: Set environment variables in dashboard
- **Manual Server**: Use systemd environment files or Docker secrets

### 3. SSL Configuration
Ensure your domain has valid SSL certificates. Use Let's Encrypt for free certificates.

## 🚦 Testing

### Sandbox Environment
1. Use Safaricom's sandbox credentials for testing
2. Set `MPESA_BASE_URL=https://sandbox.safaricom.co.ke`
3. Use test phone numbers (254708374149)

### Local Testing with Ngrok
```bash
# Install ngrok
ngrok http 3000

# Update CALLBACK_URL with ngrok URL
CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/callback
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **CORS errors** | Ensure frontend URL is in `allowedOrigins` |
| **Invalid phone format** | Phone must be 12 digits (2547XXXXXXXX) |
| **"Request cancelled by user"** | User declined payment on their phone |
| **Callback not received** | Ensure URL is publicly accessible and HTTPS |
| **Token generation failed** | Check Daraja credentials and network connectivity |

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or contributions:
- Create an issue in the GitHub repository
- Ensure you include relevant logs and error messages
- Provide steps to reproduce the issue

## 🚨 Important Notes

1. **M-Pesa API Limits**: Respect Safaricom's rate limits and terms of service
2. **Transaction Costs**: Normal M-Pesa transaction fees apply
3. **Testing in Production**: Always test with small amounts first
4. **Logging**: Implement proper logging for audit trails
5. **Backup Callback URL**: Consider implementing a backup callback mechanism

---

**Built with ❤️ by Silva Tech Nexus** | **Secure Payments | Modern Integration | Enterprise Ready**
