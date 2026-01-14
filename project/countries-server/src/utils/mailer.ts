import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const secure = process.env.SMTP_SECURE === "true"; // בפורט 587 זה יהיה false
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    console.error("❌ SMTP missing vars:", { host, user: !!user, pass: !!pass });
    throw new Error("SMTP env vars are missing");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // הוספת הבלוק הזה פותרת בעיות חיבור רבות:
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log(`📧 Attempting to send mail to: ${to}...`);
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("✅ Mail sent successfully! ID:", info.messageId);
    return info;
  } catch (err: any) {
    console.error("❌ SMTP Error details:", err.message);
    throw err;
  }
}