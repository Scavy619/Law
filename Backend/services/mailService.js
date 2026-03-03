// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export async function sendEmail({to, subject, html}){
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     html,
//   });
// }

// using brevo now since we gotta host it and render blocks smtp
import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: "LawBridge",
        email: "lawbridgeorg@gmail.com",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    return response;
  } catch (error) {
    console.error("Brevo email error:", error);
    throw new Error("Email sending failed");
  }
};
