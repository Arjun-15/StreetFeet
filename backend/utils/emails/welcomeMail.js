// Import the necessary modules here
import nodemailer from 'nodemailer';

// Create a transporter object using your email service's configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // true for 465, false for other ports
  service: process.env.SMPT_SERVICE, // You can use other services like 'smtp', 'sendgrid', etc.
  auth: {
    user: process.env.STORFLEET_SMPT_MAIL, // Your email address
    pass: process.env.STORFLEET_SMPT_MAIL_PASSWORD, // Your email password (use environment variables for security)
  },
});

export const sendWelcomeEmail = async (user) => {
  try {
    // Email options
    const mailOptions = {
      from: process.env.STORFLEET_SMPT_MAIL, // Sender address
      to: user.email, // List of receivers
      subject: 'Welcome to Our Service!', // Subject line
      html: `
        <h1>Hello ${user.name},</h1>
        <p>Welcome to our service! We are excited to have you with us.</p>
        <p>Best Regards,<br>Your Company Team</p>
      `, // HTML body content
    };

    // Send mail using the transporter
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Unable to send welcome email');
  }
};
