const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  if (!user || !pass) return null;

  // Use 'service' shortcut for Gmail for maximum reliability
  if (host.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: (port === 465),
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    // Force IPv4 to avoid IPv6 hangs on Windows/cloud
    family: 4
  });
};

const sendEmailNotification = async (to, subject, htmlBody) => {
  if (!to || !to.includes('@')) return false;

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`⚠️ Email dispatch skipped for ${to}: SMTP_USER or SMTP_PASS not set in .env`);
    return false;
  }

  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'valuelifesupport@gmail.com';
    const fromName = process.env.SMTP_FROM_NAME || 'ValueLife Essentials';

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlBody
    });
    console.log(`✅ Email dispatched successfully to ${to} [${subject}]`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Email dispatch error for ${to}:`, err.message);
    return false;
  }
};

// Verify SMTP connectivity on module load (non-blocking)
const _verifySmtp = async () => {
  const t = getTransporter();
  if (!t) {
    console.warn('⚠️ SMTP transporter not configured — email OTPs will use auto-verify fallback.');
    return;
  }
  try {
    await t.verify();
    console.log('✅ SMTP connection verified — email OTPs will be delivered.');
  } catch (err) {
    console.warn('⚠️ SMTP verification failed:', err.message, '— check credentials and network.');
  }
};
_verifySmtp();

module.exports = {
  mailTransporter: getTransporter(),
  sendEmailNotification
};
