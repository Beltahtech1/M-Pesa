import express from "express";
import dotenv from "dotenv";
import { stkPush } from "./mpesa.js";
import axios from "axios";
import cors from "cors";

dotenv.config();
const app = express();
// ✅ Allow multiple frontend URLs (Vercel + custom domain)
const allowedOrigins = [
  "https://frontendurl.com",
  "https://pay.silvatech.top",
  "https://frontendurl.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());
app.use(express.static("public"));

// Temporary store (replace with DB in production)
const transactions = {};

// 🔹 Get Access Token (used for STK & status query)
async function getAccessToken() {
  const url = `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
  const resp = await axios.get(url, {
    auth: {
      username: process.env.DARAJA_CONSUMER_KEY,
      password: process.env.DARAJA_CONSUMER_SECRET,
    },
  });
  return resp.data.access_token;
}

// 🔹 STK Push Route
app.post("/stkpush", async (req, res) => {
  try {
    let { phone, amount } = req.body;

    // Normalize phone
    if (phone.startsWith("0")) {
      phone = "254" + phone.substring(1);
    }

    const response = await stkPush(phone, amount);

    // Store transaction
    const checkoutRequestID = response.CheckoutRequestID;
    transactions[checkoutRequestID] = {
      phone,
      amount,
      status: "PENDING",
      raw: response,
    };

    res.json({
      message: "STK Push initiated",
      checkoutRequestID,
      response,
    });
  } catch (err) {
    console.error("❌ STK Push failed:", err.message);
    res.status(500).json({ error: "STK Push failed", details: err.message });
  }
});

// 🔹 Callback Route (Safaricom calls this)
app.post("/api/callback", (req, res) => {
  const callbackData = req.body;
  console.log("📥 M-Pesa Callback:", JSON.stringify(callbackData, null, 2));

  const stkCallback = callbackData?.Body?.stkCallback;
  if (stkCallback?.CheckoutRequestID) {
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    transactions[checkoutRequestID] = {
      ...transactions[checkoutRequestID],
      status: resultCode === 0 ? "SUCCESS" : "FAILED",
      resultDesc,
      mpesaReceipt: stkCallback.CallbackMetadata?.Item?.find(
        (i) => i.Name === "MpesaReceiptNumber"
      )?.Value,
    };
  }

  res.json({ ResultCode: 0, ResultDesc: "Callback received successfully" });
});

// 🔹 Check Transaction Status (from our local store)
app.get("/status/:id", (req, res) => {
  const id = req.params.id;
  if (transactions[id]) {
    res.json(transactions[id]);
  } else {
    res.status(404).json({ error: "Transaction not found" });
  }
});

// 🔹 Query Safaricom Transaction Status API (direct)
app.get("/query/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const accessToken = await getAccessToken();

    const url = `${process.env.MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`;
    const resp = await axios.post(
      url,
      {
        BusinessShortCode: process.env.BUSINESS_SHORT_CODE,
        Password: Buffer.from(
          process.env.BUSINESS_SHORT_CODE +
            process.env.PASSKEY +
            new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)
        ).toString("base64"),
        Timestamp: new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14),
        CheckoutRequestID: id,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    res.json(resp.data);
  } catch (err) {
    console.error("❌ Query failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Query failed", details: err.message });
  }
});

// Start server (Render only)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
