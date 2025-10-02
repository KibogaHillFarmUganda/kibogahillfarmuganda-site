const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// --- Basic security & parsing
app.use(cors());                 // allow requests from your website
app.use(express.json());         // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// --- Health check
app.get("/", (_req, res) => res.send("KHF Contact API is running"));

// --- Email route
app.post("/send", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "name, email, message are required" });
    }

    // Configure SMTP transport from .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,         // e.g. "mail.kibogahillfarmuganda.co.ug"
      port: Number(process.env.SMTP_PORT), // 465 (secure) or 587 (STARTTLS)
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,      // info@kibogahillfarmuganda.co.ug
        pass: process.env.EMAIL_PASS,      // mailbox/app password
      },
    });

    // Email to your inbox
    const htmlBody = `
      <h2>New Contact Form Submission</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      ${phone ? `<p><b>Phone:</b> ${phone}</p>` : ""}
      ${subject ? `<p><b>Subject:</b> ${subject}</p>` : ""}
      <p><b>Message:</b></p>
      <pre style="white-space:pre-wrap;font-family:system-ui">${message}</pre>
    `;

    await transporter.sendMail({
      from: `"KHF Website" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER, // where you receive it
      subject: subject ? `[KHF Website] ${subject}` : `[KHF Website] New message from ${name}`,
      text: `From: ${name} <${email}>\n${phone ? "Phone: " + phone + "\n" : ""}\n\n${message}`,
      html: htmlBody,
    });

    // Optional: auto-reply to the sender
    if (process.env.SEND_AUTOREPLY === "true") {
      await transporter.sendMail({
        from: `"Kiboga Hill Farm Uganda" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "We received your message",
        text:
`Hello ${name},

Thank you for contacting Kiboga Hill Farm Uganda. We’ve received your message and will get back to you shortly.

Regards,
Kiboga Hill Farm Uganda
info@kibogahillfarmuganda.co.ug`,
      });
    }

    res.json({ ok: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ ok: false, error: "Failed to send email" });
  }
});

// --- Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`KHF Contact API listening on http://localhost:${PORT}`));
