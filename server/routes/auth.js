// server/routes/auth.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // IMPORT YOUR DATABASE CONNECTION HERE

// Temporary in-memory store for OTPs (Use Redis in production)
const otpStore = {};

// --- 1. SEND OTP ---
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
        return res.status(400).json({ error: "Valid phone number required" });
    }

    // Generate Random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Save OTP to temporary store
    otpStore[phone] = otp;

    try {
        // FAST2SMS API Call
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            headers: {
                "authorization": "YOUR_FAST2SMS_API_KEY" // REPLACE THIS
            },
            params: {
                "variables_values": String(otp),
                "route": "otp",
                "numbers": phone
            }
        });

        if (response.data.return) {
            res.json({ success: true, message: "OTP sent successfully" });
        } else {
            console.error("Fast2SMS Error:", response.data);
            res.status(500).json({ error: "Failed to send SMS" });
        }

    } catch (error) {
        console.error("SMS API Failed:", error.message);
        // Fallback for development (Check your console)
        console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
        res.json({ success: true, message: "OTP logged in console (Dev Mode)" });
    }
});

// --- 2. VERIFY OTP & LOGIN/REGISTER USER ---
router.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    const storedOtp = otpStore[phone];

    // 1. Validate OTP
    if (!storedOtp || String(storedOtp) !== String(otp)) {
        return res.status(400).json({ error: "Invalid OTP" });
    }

    // Clear OTP after use
    delete otpStore[phone];

    try {
        // 2. CHECK IF USER EXISTS IN DB
        // (Assuming you use mysql2 with promises)
        const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);

        let user = users[0];

        // 3. IF NEW USER -> CREATE THEM
        if (!user) {
            const [result] = await db.query('INSERT INTO users (phone, created_at) VALUES (?, NOW())', [phone]);
            const newUserId = result.insertId;
            user = { id: newUserId, phone: phone };
        }

        // 4. GENERATE TOKEN WITH USER ID
        // This token now identifies THIS specific user for all future requests
        const token = jwt.sign(
            { id: user.id, phone: user.phone },
            'YOUR_JWT_SECRET_KEY',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, phone: user.phone }
        });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Login failed due to server error" });
    }
});

module.exports = router;