import nodemailer from 'nodemailer';

export const Email = async (to: string, subject: string, text: string) => {
  try {

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

 
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to,
      subject, 
      text, 
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};