import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function getAccessToken() {
  const url = `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;

  const auth = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`
  ).toString("base64");

  try {
    const { data } = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return data.access_token;
  } catch (error) {
    console.error("❌ Failed to get access token:", error.response?.data || error.message);
    throw error;
  }
}

export async function stkPush(phone, amount) {
  const token = await getAccessToken();
  const url = `${process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`;

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    `${process.env.BUSINESS_SHORT_CODE}${process.env.PASSKEY}${timestamp}`
  ).toString("base64");

  const payload = {
    BusinessShortCode: process.env.BUSINESS_SHORT_CODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline", 
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.BUSINESS_SHORT_CODE,
    PhoneNumber: phone,
    CallBackURL: process.env.CALLBACK_URL,
    AccountReference: "Silva Tech",
    TransactionDesc: "Payment for services",
  };

  try {
    const { data } = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("❌ STK Push failed:", error.response?.data || error.message);
    throw error;
  }
}
