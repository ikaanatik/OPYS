import nodemailer from "nodemailer";

const sendEmail = async (mailOptions) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: process.env.SMTP_SERVER_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  let info = await transporter.sendMail(mailOptions);
};

export default sendEmail;
