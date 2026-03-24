const nodemailer = require('nodemailer');

// Create a reusable transporter using connection pooling
const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  maxConnections: 5, // Default is 5
  maxMessages: 100, // Default is 100 messages per connection
});

const sendEmail = async (options) => {
  // Define the email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'College Administration'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
