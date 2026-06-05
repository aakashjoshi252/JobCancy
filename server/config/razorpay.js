const Razorpay = require("razorpay");

let razorpayInstance = null;
let cachedKeyId = "";
let cachedKeySecret = "";

const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID;

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay credentials are not configured");
    error.code = "RAZORPAY_CONFIG_MISSING";
    throw error;
  }

  if (!razorpayInstance || cachedKeyId !== keyId || cachedKeySecret !== keySecret) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    cachedKeyId = keyId;
    cachedKeySecret = keySecret;
  }

  return razorpayInstance;
};

module.exports = {
  getRazorpayInstance,
  getRazorpayKeyId,
};
