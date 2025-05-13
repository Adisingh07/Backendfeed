import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const app = express();
const port = process.env.PORT || 1456;

// Enable CORS
app.use(cors());

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

app.post("/api/feedback", upload.single("attachment"), async (req, res) => {
  const { name, email, rating, message } = req.body;
  const file = req.file;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions: any = {
      from: `"Feedback Bot" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: "New Feedback Received",
      text: `Name: ${name}\nEmail: ${email}\nRating: ${rating}\n\nMessage:\n${message}`
    };

    if (file) {
      mailOptions.attachments = [
        {
          filename: file.originalname,
          path: file.path
        }
      ];
    }

    await transporter.sendMail(mailOptions);

    // Delete file after sending
    if (file) fs.unlinkSync(file.path);

    res.json({ success: true, message: "Feedback sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error sending email." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
