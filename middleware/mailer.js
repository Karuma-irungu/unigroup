'use strict';
const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send notification to the Unigroup team when a new enquiry arrives.
 */
async function sendEnquiryNotification(data) {
  const { name, company, phone, email, service, message } = data;
  const companyName = process.env.COMPANY_NAME || 'Unigroup Transporters Ltd';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .header { background: #0a0a0a; padding: 28px 32px; border-bottom: 4px solid #C41E1E; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
  .header span { color: #C41E1E; }
  .body { padding: 32px; }
  .badge { display: inline-block; background: #C41E1E; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; margin-bottom: 24px; border-radius: 2px; }
  .field { margin-bottom: 18px; }
  .field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 4px; }
  .field-value { font-size: 15px; color: #111; font-weight: 500; }
  .message-box { background: #f8f8f8; border-left: 3px solid #C41E1E; padding: 16px 20px; margin-top: 4px; font-size: 15px; color: #333; line-height: 1.6; }
  .divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
  .footer { padding: 20px 32px; background: #f8f8f8; font-size: 12px; color: #aaa; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1><span>Uni</span>group Transporters</h1>
  </div>
  <div class="body">
    <div class="badge">New Enquiry</div>
    <div class="field">
      <div class="field-label">Name</div>
      <div class="field-value">${escHtml(name)}</div>
    </div>
    ${company ? `
    <div class="field">
      <div class="field-label">Company</div>
      <div class="field-value">${escHtml(company)}</div>
    </div>` : ''}
    ${phone ? `
    <div class="field">
      <div class="field-label">Phone</div>
      <div class="field-value">${escHtml(phone)}</div>
    </div>` : ''}
    <div class="field">
      <div class="field-label">Email</div>
      <div class="field-value"><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></div>
    </div>
    ${service ? `
    <div class="field">
      <div class="field-label">Service Required</div>
      <div class="field-value">${escHtml(service)}</div>
    </div>` : ''}
    <hr class="divider">
    <div class="field">
      <div class="field-label">Message</div>
      <div class="message-box">${escHtml(message).replace(/\n/g, '<br>')}</div>
    </div>
  </div>
  <div class="footer">${companyName} – Website Contact Form</div>
</div>
</body>
</html>`;

  return getTransporter().sendMail({
    from:    `"${companyName} Website" <${process.env.EMAIL_FROM}>`,
    to:      process.env.EMAIL_TO,
    subject: `New Enquiry from ${name}${company ? ` (${company})` : ''}`,
    html,
    replyTo: email,
  });
}

/**
 * Send confirmation email to the person who enquired.
 */
async function sendEnquiryConfirmation(data) {
  const { name, email } = data;
  const companyName = process.env.COMPANY_NAME || 'Unigroup Transporters Ltd';
  const companyPhone = process.env.COMPANY_PHONE || '+254 700 000 000';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .header { background: #0a0a0a; padding: 28px 32px; border-bottom: 4px solid #C41E1E; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
  .header span { color: #C41E1E; }
  .body { padding: 32px; }
  h2 { font-size: 22px; color: #111; margin: 0 0 16px; }
  p { font-size: 15px; color: #555; line-height: 1.7; margin: 0 0 16px; }
  .highlight { color: #C41E1E; font-weight: 700; }
  .footer { padding: 20px 32px; background: #f8f8f8; font-size: 12px; color: #aaa; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1><span>Uni</span>group Transporters</h1>
  </div>
  <div class="body">
    <h2>Thanks for reaching out, ${escHtml(name)}!</h2>
    <p>We've received your enquiry and our team will get back to you within <span class="highlight">24 hours</span>.</p>
    <p>If your shipment is urgent, please call us directly at <span class="highlight">${companyPhone}</span> and we'll assist you right away.</p>
    <p>– The ${companyName} Team</p>
  </div>
  <div class="footer">${companyName} | Home of Logistics Convenience</div>
</div>
</body>
</html>`;

  return getTransporter().sendMail({
    from:    `"${companyName}" <${process.env.EMAIL_FROM}>`,
    to:      email,
    subject: `We've received your enquiry – ${companyName}`,
    html,
  });
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

module.exports = { sendEnquiryNotification, sendEnquiryConfirmation };
