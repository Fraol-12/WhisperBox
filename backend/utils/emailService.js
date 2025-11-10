const nodemailer = require('nodemailer');

let transporter = null;

const initializeEmailService = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

const sendComplaintNotification = async (ticketId, department) => {
  if (!transporter) {
    console.log('Email service not configured. Skipping email notification.');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Admin email
      subject: `New Complaint - ${ticketId}`,
      html: `
        <h2>New Complaint Received</h2>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Department:</strong> ${department}</p>
        <p>Please log in to the admin dashboard to review and respond to this complaint.</p>
      `
    });
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

// Initialize on module load
initializeEmailService();

module.exports = { sendComplaintNotification, initializeEmailService };

