// Runtime sugerido: Node.js 18.x
// Permisos IAM: ses:SendEmail
// Variables de entorno recomendadas:
//  - AWS_REGION=us-east-1
//  - CORS_ORIGIN=https://www.tudominio.com
//  - FROM_EMAIL=noreply@tudominio.com
//  - NOTIFICATION_EMAIL=destinatario@tudominio.com

const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

const client = new SESv2Client({ region: process.env.AWS_REGION || "us-east-1" });

const ORIGIN = process.env.CORS_ORIGIN || "https://www.tudominio.com";
const TO_EMAIL = process.env.NOTIFICATION_EMAIL || "mauro@editessolutions.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@editessolutions.com";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  // "Access-Control-Allow-Credentials": "true", // habilitar solo si lo necesitás
};

// --- Utilidades ---
function sanitizeLine(str, max = 100) {
  return String(str || "")
    .replace(/[\r\n]+/g, " ") // evita inyección de cabeceras
    .trim()
    .slice(0, max);
}

function sanitizeMultiline(str, max = 3000) {
  return String(str || "").trim().slice(0, max);
}

function safeSubject(str) {
  const s = sanitizeLine(str, 120);
  // Permite letras, números, espacios y algunos símbolos comunes (incluye acentos)
  return s.replace(/[^0-9A-Za-z áéíóúÁÉÍÓÚüÜñÑ.,:;_@\-()/]/g, "");
}

function t(language, en, es) {
  return language === "es" ? es : en;
}

function parseBody(event) {
  if (!event || !event.body) return {};
  let raw = event.body;

  // API Gateway puede enviar el body en base64
  if (event.isBase64Encoded) {
    raw = Buffer.from(raw, "base64").toString("utf8");
  }

  const contentType =
    (event.headers?.["content-type"] || event.headers?.["Content-Type"] || "").toLowerCase();

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// --- Handler ---
exports.handler = async (event) => {
  // Preflight CORS
  if (event?.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: jsonHeaders, body: "" };
  }

  // Solo POST
  if (event?.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
    };
  }

  try {
    const { name, email, message, language = "en" } = parseBody(event);

    // Validaciones
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: false,
          message: t(language, "All fields are required.", "Todos los campos son obligatorios."),
        }),
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: false,
          message: t(
            language,
            "Please enter a valid email address.",
            "Por favor ingrese un email válido."
          ),
        }),
      };
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
<p>${sanitizedMessage.replace(/\n/g, "<br>")}</p>
<hr>
<p><small>Submitted on: ${nowIso}</small></p>`.trim();

    const textBody = `
New Contact Form Submission - Edites Solutions

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Message:
${sanitizedMessage}

Submitted on: ${nowIso}`.trim();

    // Envío con SESv2
    const cmd = new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      Destination: { ToAddresses: [TO_EMAIL] },
      ReplyToAddresses: [sanitizedEmail], // responder al remitente
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: textBody, Charset: "UTF-8" },
            Html: { Data: htmlBody, Charset: "UTF-8" },
          },
        },
      },
      // ConfigurationSetName: "tu-config-set", // opcional para métricas/seguimiento
    });

    await client.send(cmd);

    console.log(`Contact form submitted by ${sanitizedEmail} at ${nowIso}`);

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        message: t(
          language,
          "Message sent successfully. We will get back to you soon.",
          "Mensaje enviado exitosamente. Nos pondremos en contacto pronto."
        ),
      }),
    };
  } catch (error) {
    console.error("Error processing contact form:", error);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: false,
        message: t(
          "en",
          "Internal server error. Please try again later.",
          "Error interno. Por favor, inténtalo más tarde."
        ),
      }),
    };
  }
};