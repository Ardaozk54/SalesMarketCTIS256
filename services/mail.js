import nodemailer from "nodemailer";

const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;

const transporter = hasEmailCredentials
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email, code) {
  if (!transporter) {
    console.log(
      `Email credentials are missing. Verification code for ${email}: ${code}`
    );
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Sustainable Discount Marketplace Verification Code",
    text: `Your verification code is: ${code}`,
  });
}
