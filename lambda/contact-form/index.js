// index.js - CommonJS (require funciona)
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.AWS_REGION || 'us-east-1' });

const ORIGIN = process.env.CORS_ORIGIN || 'https://editessolutions.com';
const TO_EMAIL = process.env.NOTIFICATION_EMAIL || 'mauro@editessolutions.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@editessolutions.com';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function method(event) {
  return event?.httpMethod || event?.requestContext?.http?.method || '';
}
function sanitizeLine(str, max = 100) {
  return String(str || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}
function sanitizeMultiline(str, max = 3000) {
  return String(str || '').trim().slice(0, max);
}
function safeSubject(str) {
  const s = sanitizeLine(str, 120);
  return s.replace(/[^0-9A-Za-z áéíóúÁÉÍÓÚüÜñÑ.,:;_@\-()/]/g, '');
}
function t(lang, en, es) { return lang === 'es' ? es : en; }
function parseBody(event) {
  let raw = event?.body || '';
  if (event?.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8');
  const ct = (event?.headers?.['content-type'] || event?.headers?.['Content-Type'] || '').toLowerCase();
  if (ct.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
  try { return JSON.parse(raw); } catch { return {}; }
}

exports.handler = async (event) => {
  const m = method(event).toUpperCase();
  if (m === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (m !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success:false, message:'Method Not Allowed' }) };

  try {
    const { name, email, message, language = 'en' } = parseBody(event);
    if (!name || !email || !message) {
      return { statusCode: 400, headers, body: JSON.stringify({ success:false, message: t(language,'All fields are required.','Todos los campos son obligatorios.') }) };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return { statusCode: 400, headers, body: JSON.stringify({ success:false, message: t(language,'Please enter a valid email address.','Por favor ingrese un email válido.') }) };
    }

    const sanitizedName = sanitizeLine(name, 100);
    const sanitizedEmail = sanitizeLine(email, 120);
    const sanitizedMessage = sanitizeMultiline(message, 3000);
    const nowIso = new Date().toISOString();
    const subject = safeSubject(`New Contact Form: ${sanitizedName} - Edites Solutions`);

    const htmlBody = `
<h2>New Contact Form Submission - Edites Solutions</h2>
<p><strong>Name:</strong> ${sanitizedName}</p>
<p><strong>Email:</strong> ${sanitizedEmail}</p>
<p><strong>Message:</strong></p>
<p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
<hr>
<p><small>Submitted on: ${nowIso}</small></p>`.trim();

    const textBody = `New Contact Form Submission - Edites Solutions

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Message:
${sanitizedMessage}

Submitted on: ${nowIso}`.trim();

    await ses.sendEmail({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [TO_EMAIL] },
      ReplyToAddresses: [sanitizedEmail],
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: {
          Text: { Charset: 'UTF-8', Data: textBody },
          Html: { Charset: 'UTF-8', Data: htmlBody }
        }
      }
    }).promise();

    return { statusCode: 200, headers, body: JSON.stringify({ success:true, message: t(language,'Message sent successfully. We will get back to you soon.','Mensaje enviado exitosamente. Nos pondremos en contacto pronto.') }) };
  } catch (err) {
    console.error('Error processing contact form:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success:false, message: t('en','Internal server error. Please try again later.','Error interno. Por favor, inténtalo más tarde.') }) };
  }
};